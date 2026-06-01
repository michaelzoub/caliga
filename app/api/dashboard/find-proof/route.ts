import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAX_SELECTION_CHARS = 1600;
const MAX_CONTEXT_CHARS = 4000;
const MODEL = process.env.OPENAI_PROOF_MODEL ?? "gpt-4o-mini";

type SearchPlan = {
  queries?: string[];
  research_question?: string;
};

type EvidenceSource = {
  id: string;
  source: "OpenAlex" | "arXiv" | "Crossref";
  title: string;
  authors: string[];
  year: number | null;
  venue: string;
  url: string;
  doi?: string;
  citedBy?: number;
  abstract?: string;
};

type ProofSummary = {
  answer?: string;
  caveats?: string[];
  sources?: {
    id: string;
    relevance: string;
    useful_data?: string;
  }[];
  suggested_insert?: string;
};

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function parseJsonObject<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

function decodeXml(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function callOpenAI(
  key: string,
  messages: { role: "system" | "user"; content: string }[],
  maxCompletionTokens: number
) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.15,
      max_completion_tokens: maxCompletionTokens,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI request failed: ${detail.slice(0, 240)}`);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "";
}

async function buildSearchPlan(key: string, selection: string, context: string) {
  const raw = await callOpenAI(
    key,
    [
      {
        role: "system",
        content:
          "Return JSON only. Convert the highlighted claim into 2-4 concise academic search queries. Prefer measurable concepts, dataset names, paper keywords, and synonyms. Do not invent sources.",
      },
      {
        role: "user",
        content: `Highlighted text:\n${selection}\n\nArticle context:\n${context}`,
      },
    ],
    300
  );
  const parsed = parseJsonObject<SearchPlan>(raw);
  const queries = (parsed?.queries ?? [])
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 4);
  return queries.length ? queries : [selection];
}

function abstractFromInvertedIndex(index: unknown) {
  if (!index || typeof index !== "object") return "";
  const entries = Object.entries(index as Record<string, number[]>);
  const words: { word: string; pos: number }[] = [];
  for (const [word, positions] of entries) {
    for (const pos of positions) words.push({ word, pos });
  }
  return words
    .sort((a, b) => a.pos - b.pos)
    .map((x) => x.word)
    .join(" ");
}

async function searchOpenAlex(query: string): Promise<EvidenceSource[]> {
  const params = new URLSearchParams({
    search: query,
    "per-page": "5",
    sort: "relevance_score:desc",
  });
  if (process.env.OPENALEX_MAILTO) params.set("mailto", process.env.OPENALEX_MAILTO);
  const res = await fetch(`https://api.openalex.org/works?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: Record<string, unknown>[] };
  return (json.results ?? []).map((work, i) => {
    const authorships = Array.isArray(work.authorships) ? work.authorships : [];
    const authors = authorships
      .map((a) =>
        cleanText((a as { author?: { display_name?: unknown } }).author?.display_name)
      )
      .filter(Boolean)
      .slice(0, 5);
    const primary = work.primary_location as
      | { source?: { display_name?: unknown }; landing_page_url?: unknown }
      | null
      | undefined;
    const doi = cleanText(work.doi);
    return {
      id: `openalex-${i + 1}`,
      source: "OpenAlex",
      title: cleanText(work.title) || "Untitled work",
      authors,
      year: typeof work.publication_year === "number" ? work.publication_year : null,
      venue: cleanText(primary?.source?.display_name),
      url:
        cleanText(primary?.landing_page_url) ||
        doi ||
        cleanText(work.id) ||
        "https://openalex.org",
      doi: doi || undefined,
      citedBy:
        typeof work.cited_by_count === "number" ? work.cited_by_count : undefined,
      abstract: truncate(abstractFromInvertedIndex(work.abstract_inverted_index), 900),
    } satisfies EvidenceSource;
  });
}

async function searchCrossref(query: string): Promise<EvidenceSource[]> {
  const params = new URLSearchParams({
    query,
    rows: "5",
    sort: "relevance",
  });
  const res = await fetch(`https://api.crossref.org/works?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    message?: { items?: Record<string, unknown>[] };
  };
  return (json.message?.items ?? []).map((item, i) => {
    const authorItems = Array.isArray(item.author) ? item.author : [];
    const authors = authorItems
      .map((a) => {
        const author = a as { given?: unknown; family?: unknown };
        return cleanText(`${cleanText(author.given)} ${cleanText(author.family)}`);
      })
      .filter(Boolean)
      .slice(0, 5);
    const title = Array.isArray(item.title) ? cleanText(item.title[0]) : cleanText(item.title);
    const containerTitle = Array.isArray(item["container-title"])
      ? cleanText(item["container-title"][0])
      : cleanText(item["container-title"]);
    const dateParts = (item.published as { "date-parts"?: number[][] } | undefined)?.[
      "date-parts"
    ];
    const year = Array.isArray(dateParts?.[0]) ? dateParts?.[0]?.[0] ?? null : null;
    const doi = cleanText(item.DOI);
    return {
      id: `crossref-${i + 1}`,
      source: "Crossref",
      title: title || "Untitled work",
      authors,
      year,
      venue: containerTitle,
      url: cleanText(item.URL) || (doi ? `https://doi.org/${doi}` : "https://crossref.org"),
      doi: doi || undefined,
      abstract: truncate(cleanText(item.abstract), 900),
    } satisfies EvidenceSource;
  });
}

async function searchArxiv(query: string): Promise<EvidenceSource[]> {
  const params = new URLSearchParams({
    search_query: `all:${query}`,
    start: "0",
    max_results: "5",
    sortBy: "relevance",
    sortOrder: "descending",
  });
  const res = await fetch(`https://export.arxiv.org/api/query?${params}`, {
    headers: { Accept: "application/atom+xml" },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];
  return entries.map((entry, i) => {
    const title = decodeXml(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const summary = decodeXml(entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] ?? "")
      .replace(/\s+/g, " ")
      .trim();
    const published = entry.match(/<published>(\d{4})/)?.[1];
    const id = decodeXml(entry.match(/<id>([\s\S]*?)<\/id>/)?.[1] ?? "").trim();
    const authors = Array.from(entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g))
      .map((m) => decodeXml(m[1]).replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 5);
    return {
      id: `arxiv-${i + 1}`,
      source: "arXiv",
      title: title || "Untitled preprint",
      authors,
      year: published ? Number(published) : null,
      venue: "arXiv",
      url: id || "https://arxiv.org",
      abstract: truncate(summary, 900),
    } satisfies EvidenceSource;
  });
}

function dedupeSources(sources: EvidenceSource[]) {
  const seen = new Set<string>();
  const out: EvidenceSource[] = [];
  for (const source of sources) {
    const key = (source.doi || source.url || source.title).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(source);
  }
  return out.slice(0, 12).map((source, index) => ({
    ...source,
    id: `S${index + 1}`,
  }));
}

async function summarizeEvidence(
  key: string,
  selection: string,
  context: string,
  sources: EvidenceSource[]
) {
  const raw = await callOpenAI(
    key,
    [
      {
        role: "system",
        content:
          "Return JSON only. You are a careful research assistant. Use only the provided API results. Do not claim a paper proves more than its title/abstract/metadata supports. If evidence is weak, say so.",
      },
      {
        role: "user",
        content: JSON.stringify({
          highlighted_text: selection,
          article_context: context,
          sources,
          required_shape: {
            answer: "2-4 sentence evidence summary grounded only in sources",
            caveats: ["limitations or uncertainty"],
            sources: [
              {
                id: "S1",
                relevance: "why this source matters",
                useful_data: "specific number, dataset, method, or finding if present",
              },
            ],
            suggested_insert: "one concise sentence the writer could paste into the article",
          },
        }),
      },
    ],
    900
  );
  return parseJsonObject<ProofSummary>(raw) ?? {};
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_token")?.value;
  if (token !== process.env.DASHBOARD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  let body: { selection?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const selection = cleanText(body.selection);
  const context = truncate(cleanText(body.context), MAX_CONTEXT_CHARS);
  if (!selection) {
    return NextResponse.json({ error: "Highlighted text required" }, { status: 400 });
  }
  if (selection.length > MAX_SELECTION_CHARS) {
    return NextResponse.json(
      { error: `Highlight is too long (max ${MAX_SELECTION_CHARS} characters)` },
      { status: 400 }
    );
  }

  try {
    const queries = await buildSearchPlan(key, selection, context);
    const sourceGroups = await Promise.all(
      queries.flatMap((query) => [
        searchOpenAlex(query),
        searchArxiv(query),
        searchCrossref(query),
      ])
    );
    const sources = dedupeSources(sourceGroups.flat());
    if (!sources.length) {
      return NextResponse.json({
        ok: true,
        queries,
        summary: {
          answer: "No strong scholarly matches were returned by OpenAlex, arXiv, or Crossref for this highlight.",
          caveats: ["Try highlighting a more specific empirical claim or named concept."],
          sources: [],
          suggested_insert: "",
        },
        sources: [],
      });
    }

    const summary = await summarizeEvidence(key, selection, context, sources);
    return NextResponse.json({ ok: true, queries, summary, sources });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Proof lookup failed.";
    console.warn("[find-proof]", message);
    return NextResponse.json(
      { error: "Proof lookup failed", detail: message.slice(0, 240) },
      { status: 502 }
    );
  }
}
