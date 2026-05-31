"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type GraphRow = {
  ticker: string;
  signal: string;
  note: string;
  group: string;
  movePercent: number | null;
  followsPlay: boolean | null;
};

type TwitterGraphProps = {
  rows: GraphRow[];
  alignment: string;
  timestamp: string;
};

const green = "#11823b";
const greenDark = "#0b612b";
const red = "#c9352b";
const redDark = "#98231d";
const black = "#111111";
const muted = "#666666";
const rule = "#ded9d2";
const exportWidth = 1200;
const exportHeight = 1000;

function pct(value: number | null) {
  if (value === null) return "N/A";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function expectedLabel(signal: string) {
  return signal === "Put" || signal === "Trim" || signal === "Exit" ? "bearish" : "bullish";
}

export function TwitterGraph({
  rows,
  alignment,
  timestamp,
}: TwitterGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copyState, setCopyState] = useState("Preparing...");
  const [pngBlob, setPngBlob] = useState<Blob | null>(null);
  const maxAbs = useMemo(
    () => Math.max(...rows.map((row) => Math.abs(row.movePercent ?? 0)), 1),
    [rows],
  );
  const visualRows = useMemo(() => {
    const output: Array<{ kind: "group"; label: string } | { kind: "row"; row: GraphRow }> = [];
    let currentGroup = "";

    for (const row of rows) {
      if (row.group !== currentGroup) {
        currentGroup = row.group;
        output.push({ kind: "group", label: currentGroup });
      }
      output.push({ kind: "row", row });
    }

    return output;
  }, [rows]);
  const layoutRows = useMemo(() => {
    let y = 286;

    return visualRows.map((item) => {
      const positioned = { ...item, y };
      y += item.kind === "group" ? 30 : 24;
      return positioned;
    });
  }, [visualRows]);

  const serializeSvg = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return "";
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  }, []);

  const renderPngBlob = useCallback(async () => {
    const svgText = serializeSvg();
    const image = new Image();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob) throw new Error("PNG export unavailable");
      return pngBlob;
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [serializeSvg]);

  useEffect(() => {
    let active = true;

    renderPngBlob()
      .then((blob) => {
        if (!active) return;
        setPngBlob(blob);
        setCopyState("Copy PNG");
      })
      .catch(() => {
        if (!active) return;
        setCopyState("Download PNG");
      });

    return () => {
      active = false;
    };
  }, [renderPngBlob]);

  const copyGraph = async () => {
    if (!pngBlob) return;
    setCopyState("Copying...");
    try {
      if ("ClipboardItem" in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
        setCopyState("Copied PNG");
      } else {
        setCopyState("Use download");
      }
    } catch {
      setCopyState("Use download");
    } finally {
      window.setTimeout(() => setCopyState("Copy PNG"), 2200);
    }
  };

  const downloadGraph = async () => {
    const blob = pngBlob ?? (await renderPngBlob());
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "aschenbrenner-signal-tape.png";
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            twitter-ready graph
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
            Aschenbrenner signal tape
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyGraph}
            disabled={!pngBlob}
            className="border border-zinc-950 bg-zinc-950 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-zinc-950 disabled:cursor-wait disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-500"
          >
            {copyState}
          </button>
          <button
            type="button"
            onClick={downloadGraph}
            className="border border-zinc-300 bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:border-zinc-950"
          >
            Download PNG
          </button>
        </div>
      </div>

      <div className="overflow-auto border border-zinc-200 bg-[#f8f4ee] p-3">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${exportWidth} ${exportHeight}`}
          role="img"
          aria-label="Caliga chart comparing stock price moves against disclosed puts, calls, adds, trims, and exits."
          className="aspect-[6/5] min-w-[900px] bg-white"
        >
          <rect width={exportWidth} height={exportHeight} fill="#ffffff" />
          <text x="56" y="76" fill={black} fontFamily="Arial, sans-serif" fontSize="42" fontWeight="700">
            Did the tape follow the 13F?
          </text>
          <text x="56" y="110" fill={muted} fontFamily="Arial, sans-serif" fontSize="18">
            Latest price move vs. Aschenbrenner puts, calls, adds, trims, and exits
          </text>

          <g transform="translate(56 136)">
            <rect width="190" height="72" fill="#fff7ee" stroke={rule} />
            <text x="18" y="24" fill={muted} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700">
              ALIGNMENT
            </text>
            <text x="18" y="58" fill={black} fontFamily="Arial, sans-serif" fontSize="32" fontWeight="700">
              {alignment}
            </text>
          </g>

          <line x1="56" x2="1144" y1="250" y2="250" stroke={rule} />
          <line x1="820" x2="820" y1="266" y2="936" stroke="#bfb8ae" />
          <text x="56" y="226" fill={muted} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700">
            DISCLOSED PLAY
          </text>
          <text x="570" y="226" fill={muted} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" textAnchor="end">
            24H
          </text>
          <text x="820" y="226" fill={muted} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" textAnchor="middle">
            PRICE MOVE
          </text>
          <text x="1144" y="226" fill={muted} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700" textAnchor="end">
            FOLLOWED?
          </text>

          {layoutRows.map((item, index) => {
            const y = item.y;
            if (item.kind === "group") {
              return (
                <g key={`group-${item.label}`}>
                  <rect x="56" y={y - 18} width="1088" height="24" fill="#f8f4ee" stroke={rule} />
                  <text
                    x="68"
                    y={y - 2}
                    fill={black}
                    fontFamily="Arial, sans-serif"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {item.label.toUpperCase()}
                  </text>
                </g>
              );
            }

            const { row } = item;
            const move = row.movePercent ?? 0;
            const width = Math.max((Math.abs(move) / maxAbs) * 210, 3);
            const x = move >= 0 ? 820 : 820 - width;
            const fill = move >= 0 ? green : red;
            const followed = row.followsPlay ? "YES" : row.followsPlay === false ? "NO" : "N/A";
            const expected = expectedLabel(row.signal);
            const bandFill = expected === "bullish" ? "#f0fbf4" : "#fff1f0";
            const typeFill = expected === "bullish" ? "#e2f7ea" : "#fde4e2";
            const typeStroke = expected === "bullish" ? "#9bd7b0" : "#ebb0ab";
            const typeText = expected === "bullish" ? greenDark : redDark;
            const indicator = row.followsPlay ? `with ${expected}` : `against ${expected}`;

            return (
              <g key={`${row.ticker}-${row.signal}-${index}`}>
                <rect x="56" y={y - 15} width="1088" height="22" fill={bandFill} stroke="#ffffff" />
                <text x="56" y={y} fill={black} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700">
                  {row.ticker}
                </text>
                <rect x="116" y={y - 15} width="110" height="18" fill={typeFill} stroke={typeStroke} />
                <text
                  x="171"
                  y={y - 2}
                  fill={typeText}
                  fontFamily="Arial, sans-serif"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {row.signal.toUpperCase()} / {expected}
                </text>
                <text x="254" y={y} fill={muted} fontFamily="Arial, sans-serif" fontSize="13">
                  {row.note}
                </text>
                <text
                  x="570"
                  y={y}
                  fill={fill}
                  fontFamily="Arial, sans-serif"
                  fontSize="14"
                  fontWeight="700"
                  textAnchor="end"
                >
                  {pct(row.movePercent)}
                </text>
                <rect x={x} y={y - 11} width={width} height="13" fill={fill} />
                <text
                  x="1056"
                  y={y}
                  fill={muted}
                  fontFamily="Arial, sans-serif"
                  fontSize="12"
                  textAnchor="end"
                >
                  {indicator}
                </text>
                <text
                  x="1144"
                  y={y}
                  fill={row.followsPlay ? greenDark : redDark}
                  fontFamily="Arial, sans-serif"
                  fontSize="14"
                  fontWeight="700"
                  textAnchor="end"
                >
                  {followed}
                </text>
              </g>
            );
          })}

          <text x="56" y="972" fill={muted} fontFamily="Arial, sans-serif" fontSize="13">
            Source: Stooq latest quote feed · {timestamp}
          </text>
        </svg>
      </div>
    </div>
  );
}
