import { buildAssistRepairSystemPrompt } from "@/lib/graphics-assist-prompts";
import { extractTsvFromModelJson } from "@/lib/extract-tsv-from-model-json";
import {
  parseFlowPaste,
  serializeFlowPasteOk,
  validatePasteForChart,
  type ChartPasteKind,
} from "@/lib/graphics-paste-parsers";

export type ChartTsvValidation =
  | { ok: true; tsv: string }
  | { ok: false; error: string };

export function normalizeChartTsv(
  chartKind: ChartPasteKind,
  tsv: string
): ChartTsvValidation {
  const validated = validatePasteForChart(chartKind, tsv);
  if (!validated.ok) return { ok: false, error: validated.error };

  let outTsv = tsv.trim();
  if (chartKind === "flow") {
    const pr = parseFlowPaste(outTsv);
    if (pr.ok) outTsv = serializeFlowPasteOk(pr);
  }
  return { ok: true, tsv: outTsv };
}

export async function repairChartTsv({
  key,
  model,
  chartKind,
  tsv,
  validationError,
}: {
  key: string;
  model: string;
  chartKind: ChartPasteKind;
  tsv: string;
  validationError: string;
}): Promise<string | null> {
  const repairRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildAssistRepairSystemPrompt(chartKind) },
        {
          role: "user",
          content: [
            `Chart kind: ${chartKind}`,
            `Validation error: ${validationError}`,
            "Invalid TSV:",
            tsv,
            "Return corrected TSV JSON only.",
          ].join("\n\n"),
        },
      ],
    }),
  });

  if (!repairRes.ok) return null;

  const completion = (await repairRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const rawContent = completion.choices?.[0]?.message?.content ?? "";
  return extractTsvFromModelJson(rawContent);
}
