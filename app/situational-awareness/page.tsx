import type { Metadata } from "next";
import { TwitterGraph, type GraphRow } from "./TwitterGraph";

export const metadata: Metadata = {
  title: "Situational Awareness | Caliga",
  description:
    "Market reaction dashboard comparing current prices and 24h moves against Aschenbrenner's option and equity plays.",
};

type Signal = "Put" | "Call" | "Add" | "Trim" | "Exit";

type Play = {
  ticker: string;
  signal: Signal;
  note: string;
  group: "New positions" | "Biggest adds" | "Biggest trims" | "Full exits";
  size?: string;
};

type Quote = {
  ticker: string;
  date: string;
  time: string;
  close: number;
  volume: number;
  previousClose: number;
};

type Row = Play & {
  quote: Quote | null;
  movePercent: number | null;
  followsPlay: boolean | null;
};

const plays: Play[] = [
  ...["SMH", "NVDA", "ORCL", "AVGO", "AMD", "MU", "TSM", "ASML", "INTC", "GLW"].map(
    (ticker) => ({ ticker, signal: "Put" as const, note: "new put", group: "New positions" as const }),
  ),
  { ticker: "MU", signal: "Call", note: "new call", group: "New positions", size: "$422M" },
  { ticker: "TSM", signal: "Call", note: "new call", group: "New positions", size: "$355M" },
  { ticker: "SNDK", signal: "Call", note: "new call", group: "New positions", size: "$389M" },
  { ticker: "CLSK", signal: "Add", note: "+648% shares", group: "Biggest adds" },
  { ticker: "RIOT", signal: "Add", note: "+87% shares", group: "Biggest adds" },
  { ticker: "CRWV", signal: "Trim", note: "call trim, -83% shares", group: "Biggest trims" },
  { ticker: "BE", signal: "Trim", note: "-36% shares", group: "Biggest trims" },
  { ticker: "INTC", signal: "Exit", note: "call exit", group: "Full exits", size: "was $747M" },
  { ticker: "LITE", signal: "Exit", note: "full exit", group: "Full exits", size: "was $479M" },
  { ticker: "EQT", signal: "Exit", note: "full exit", group: "Full exits", size: "was $133M" },
  { ticker: "TSEM", signal: "Exit", note: "full exit", group: "Full exits", size: "was $85M" },
];

const fallbackCsv = `Symbol,Date,Time,Open,High,Low,Close,Volume,Prev
SMH.US,2026-05-18,16:34:09,565.46,567.21,543.1575,543.84,2423807,556.34
NVDA.US,2026-05-18,16:34:11,229.835,230,221.21,221.58,29713114,225.32
ORCL.US,2026-05-18,16:34:10,190,190.76,183.87,184.66,4430956,192.95
AVGO.US,2026-05-18,16:34:11,421.41,422.01,415,415.605,3233746,425.19
AMD.US,2026-05-18,16:34:11,429.74,438.8,413.56,414.15,5395318,424.1
MU.US,2026-05-18,16:34:11,750.46,757,700.1,701.42,11123666,724.66
TSM.US,2026-05-18,16:34:10,406.88,406.88,394.36,394.615,2645135,404.35
ASML.US,2026-05-18,16:34:10,1520.71,1522.305,1470.1,1471.75,398112,1501.81
INTC.US,2026-05-18,16:34:12,113.5,115.54,106.72,106.88,33130189,108.77
GLW.US,2026-05-18,16:34:10,193.24,193.655,179.8,180.19,2806272,191.81
SNDK.US,2026-05-18,16:34:09,1431.67,1440,1316,1317.7901,2711180,1407.61
CLSK.US,2026-05-18,16:34:11,13.68,13.93,12.74,12.75,7557512,13.11
RIOT.US,2026-05-18,16:34:10,23.45,23.54,22.63,22.65,3565410,23.49
CRWV.US,2026-05-18,16:34:11,106.785,106.95,100.2,100.23,7718910,107.3
BE.US,2026-05-18,16:34:09,275.66,277.795,259.45,260.8,1881772,275.95
LITE.US,2026-05-18,16:34:11,953.295,954.18,870.4991,871.9868,1753947,970.7
EQT.US,2026-05-18,16:34:07,56.35,57.48,56.09,57.405,799309,56.22
TSEM.US,2026-05-18,16:34:09,272.85,276.325,249.05,249.05,555757,273.98`;

const quoteTickers = Array.from(new Set(plays.map(({ ticker }) => ticker)));
const stooqSymbols = quoteTickers.map((ticker) => `${ticker.toLowerCase()}.us`).join("+");
const quoteUrl = `https://stooq.com/q/l/?s=${stooqSymbols}&f=sd2t2ohlcvp&h&e=csv`;

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseQuotes(csv: string) {
  const rows = csv.trim().split(/\r?\n/).slice(1);
  const quotes = new Map<string, Quote>();

  for (const line of rows) {
    const [symbol, date, time, , , , close, volume, previousClose] = line.split(",");
    if (!symbol || close === "N/D" || previousClose === "N/D") continue;

    const ticker = symbol.replace(".US", "");
    quotes.set(ticker, {
      ticker,
      date,
      time,
      close: parseNumber(close),
      volume: parseNumber(volume),
      previousClose: parseNumber(previousClose),
    });
  }

  return quotes;
}

async function getQuotes() {
  try {
    const response = await fetch(quoteUrl, {
      cache: "no-store",
      headers: { "User-Agent": "Caliga Situational Awareness/1.0" },
    });
    if (!response.ok) throw new Error(`Stooq quote fetch failed: ${response.status}`);
    return { quotes: parseQuotes(await response.text()), isFallback: false };
  } catch {
    return { quotes: parseQuotes(fallbackCsv), isFallback: true };
  }
}

function expectedDirection(signal: Signal) {
  return signal === "Put" || signal === "Trim" || signal === "Exit" ? -1 : 1;
}

function formatMoney(value: number | null) {
  if (value === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 2 : 4,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatVolume(value: number | null) {
  if (value === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatQuoteTimeEastern(quote: Quote | undefined) {
  if (!quote) return "quote unavailable";

  const [year, month, day] = quote.date.split("-").map(Number);
  const [hour, minute, second] = quote.time.split(":").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  }).format(utcDate);
}

function SignalPill({ signal }: { signal: Signal }) {
  const bearish = expectedDirection(signal) < 0;
  return (
    <span
      className={`inline-flex min-w-14 justify-center border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
        bearish
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {signal}
    </span>
  );
}

function SummaryTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-zinc-200 bg-white p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">{value}</div>
      <div className="mt-1 text-sm text-zinc-600">{detail}</div>
    </div>
  );
}

export default async function SituationalAwarenessPage() {
  const { quotes, isFallback } = await getQuotes();
  const rows: Row[] = plays.map((play) => {
    const quote = quotes.get(play.ticker) ?? null;
    const movePercent =
      quote && quote.previousClose !== 0
        ? ((quote.close - quote.previousClose) / quote.previousClose) * 100
        : null;
    const followsPlay =
      movePercent === null ? null : movePercent !== 0 && movePercent * expectedDirection(play.signal) > 0;

    return { ...play, quote, movePercent, followsPlay };
  });

  const pricedRows = rows.filter((row) => row.quote);
  const followingRows = rows.filter((row) => row.followsPlay);
  const alignment = `${((followingRows.length / Math.max(pricedRows.length, 1)) * 100).toFixed(0)}%`;
  const latestQuote = pricedRows
    .map((row) => row.quote)
    .filter((quote): quote is Quote => Boolean(quote))
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))[0];

  const graphRows: GraphRow[] = rows.map((row) => ({
    ticker: row.ticker,
    signal: row.signal,
    note: row.size ?? row.note,
    group: row.group,
    movePercent: row.movePercent,
    followsPlay: row.followsPlay,
  }));

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section className="border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              situational awareness
            </div>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold leading-none tracking-tight text-zinc-950 sm:text-6xl">
                Did the tape follow the 13F?
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                Puts, trims, and exits count as bearish signals. Calls and share adds count as bullish
                signals. Prices are latest trade versus previous close.
              </p>
            </div>
            <div className="grid gap-2">
              <SummaryTile
                label="alignment"
                value={alignment}
                detail={`${followingRows.length} of ${pricedRows.length} disclosed plays moved with signal`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <TwitterGraph
          rows={graphRows}
          alignment={alignment}
          timestamp={formatQuoteTimeEastern(latestQuote)}
        />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-10">
        <div className="overflow-hidden border border-zinc-200 bg-white">
          <div className="grid grid-cols-[5rem_4.5rem_1fr_6rem_6rem] border-b border-zinc-200 bg-zinc-950 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white max-md:hidden">
            <div>Ticker</div>
            <div>Play</div>
            <div>Details</div>
            <div>Price</div>
            <div className="text-right">24h</div>
          </div>
          <div className="divide-y divide-zinc-200">
            {rows.map((row, index) => {
              const up = (row.movePercent ?? 0) > 0;
              return (
                <div
                  key={`${row.ticker}-${row.signal}-${index}`}
                  className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[5rem_4.5rem_1fr_6rem_6rem] md:items-center"
                >
                  <div className="font-mono text-base font-bold text-zinc-950">{row.ticker}</div>
                  <SignalPill signal={row.signal} />
                  <div className="text-zinc-600">
                    {row.note}
                    {row.size ? <span className="ml-2 font-mono text-xs text-zinc-500">{row.size}</span> : null}
                    <span className="ml-2 font-mono text-xs uppercase tracking-[0.12em] text-zinc-500">
                      {row.followsPlay === null ? "N/A" : row.followsPlay ? "followed" : "faded"}
                    </span>
                  </div>
                  <div>
                    <div className="font-mono text-zinc-950">{formatMoney(row.quote?.close ?? null)}</div>
                    <div className="text-xs text-zinc-500">vol {formatVolume(row.quote?.volume ?? null)}</div>
                  </div>
                  <div className={`text-right font-mono font-semibold ${up ? "text-emerald-700" : "text-red-700"}`}>
                    {formatPercent(row.movePercent)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 border-t border-zinc-200 pt-4 text-xs leading-5 text-zinc-500">
          Source: Stooq latest quote feed.{" "}
          {isFallback
            ? "Live fetch failed, so this render is using the embedded May 18, 2026 fallback snapshot."
            : "This render used live quote data."}
        </div>
      </section>
    </main>
  );
}
