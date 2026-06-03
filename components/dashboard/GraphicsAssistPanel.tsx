"use client";

import { ImagePlus, Loader2, MessageSquare, X } from "lucide-react";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type DragEvent,
} from "react";
import type { ChartPasteKind } from "@/lib/graphics-paste-parsers";
import { cn } from "@/lib/utils";

const TOK = {
  textPrimary: "#111111",
  textMuted: "#BC7C3C",
  cardBorder: "#D8D8D8",
  pageTint: "#FFFFFF",
} as const;

const RAD = { outer: "rounded-none" as const };

const KIND_LABEL: Record<ChartPasteKind, string> = {
  bar: "Bar chart",
  hbar: "Horizontal bar",
  dot: "Dot plot",
  matrix: "Matrix",
  flow: "Flow",
  curve: "Forecast curve",
};

function fileToBase64Payload(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      const m = /^data:([^;]+);base64,([\s\S]*)$/.exec(s);
      if (!m) {
        reject(new Error("Could not read image."));
        return;
      }
      resolve({ mimeType: m[1], base64: m[2] });
    };
    r.onerror = () => reject(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
}

export function GraphicsAssistPanel({
  chartKind,
  onApplyTsv,
}: {
  chartKind: ChartPasteKind;
  onApplyTsv: (tsv: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageInputDomId = useId().replace(/:/g, "");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageErr, setImageErr] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const busy = loading || imageBusy;

  const attachImageFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageErr("Use an image file (PNG, JPEG, GIF, or WebP).");
      return;
    }
    setImageErr(null);
    setImageFile(file);
  }, []);

  const extractFromImageFile = useCallback(
    async (file: File, prompt: string) => {
      if (!file.type.startsWith("image/")) {
        setImageErr("Use an image file (PNG, JPEG, GIF, or WebP).");
        return;
      }
      setImageErr(null);
      setImageBusy(true);
      try {
        const { base64, mimeType } = await fileToBase64Payload(file);
        const res = await fetch("/api/dashboard/graphics-paste-image", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chartKind,
            imageBase64: base64,
            mimeType,
            prompt,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          tsv?: string;
          error?: string;
          detail?: string;
        };
        if (!res.ok) {
          const detail =
            typeof data.detail === "string" && data.detail.trim()
              ? data.detail
              : undefined;
          throw new Error(detail || data.error || `Request failed (${res.status})`);
        }
        if (!data.ok || typeof data.tsv !== "string") {
          throw new Error("Unexpected response from server.");
        }
        onApplyTsv(data.tsv);
        setImageFile(null);
      } catch (e) {
        setImageErr(e instanceof Error ? e.message : "Image extract failed.");
      } finally {
        setImageBusy(false);
      }
    },
    [chartKind, onApplyTsv]
  );

  const onPasteImage = useCallback(
    (e: ClipboardEvent<HTMLElement>) => {
      if (busy) return;
      const items = e.clipboardData?.items;
      if (!items?.length) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) {
            e.preventDefault();
            attachImageFile(f);
          }
          return;
        }
      }
    },
    [busy, attachImageFile]
  );

  const onDragOver = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (busy) return;
      if ([...e.dataTransfer.types].includes("Files")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setDragActive(true);
      }
    },
    [busy]
  );

  const onDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      if (busy) return;
      e.preventDefault();
      setDragActive(false);
      const first = e.dataTransfer.files?.[0];
      if (first) attachImageFile(first);
    },
    [busy, attachImageFile]
  );

  const submit = useCallback(async () => {
    const trimmed = message.trim();
    if ((!trimmed && !imageFile) || imageBusy) return;
    setError(null);
    if (imageFile) {
      await extractFromImageFile(imageFile, trimmed);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/graphics-assist", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chartKind, message: trimmed }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        tsv?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const detail =
          typeof data.detail === "string" && data.detail.trim()
            ? data.detail
            : undefined;
        setError(detail || data.error || `Request failed (${res.status})`);
        return;
      }
      if (!data.ok || typeof data.tsv !== "string") {
        setError("Unexpected response from assistant.");
        return;
      }
      onApplyTsv(data.tsv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [chartKind, message, onApplyTsv, imageBusy, imageFile, extractFromImageFile]);

  return (
    <div
      className={cn("border bg-white p-4 font-sans", RAD.outer)}
      style={{ borderColor: TOK.cardBorder }}
      onPaste={onPasteImage}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center gap-2">
        <MessageSquare
          className="size-3.5 shrink-0"
          strokeWidth={1.75}
          style={{ color: TOK.textPrimary }}
          aria-hidden
        />
        <p
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: TOK.textMuted }}
        >
          Data assist
        </p>
        <span
          className="text-[12px] font-medium"
          style={{ color: TOK.textPrimary }}
        >
          {KIND_LABEL[chartKind]}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-snug" style={{ color: TOK.textMuted }}>
        Describe the numbers or structure you want. The server validates output with the same rules as
        paste — only applies if it parses.
      </p>
      <div
        className={cn(
          "mt-3 border border-dashed px-3 py-3 text-[12px] transition-colors",
          RAD.outer,
          dragActive ? "bg-[#F5F5F5]" : "bg-white"
        )}
        style={{
          borderColor: dragActive ? TOK.textPrimary : TOK.cardBorder,
          color: TOK.textMuted,
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={imageInputRef}
            id={`graphics-assist-image-${imageInputDomId}`}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="sr-only"
            tabIndex={-1}
            disabled={busy}
            onChange={(ev) => {
              const f = ev.target.files?.[0];
              ev.target.value = "";
              if (f) attachImageFile(f);
            }}
          />
          <button
            type="button"
            disabled={busy}
            className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-xs font-medium"
            style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
            onClick={() => imageInputRef.current?.click()}
          >
            {imageBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-4" aria-hidden strokeWidth={1.75} />
            )}
            {imageBusy ? "Reading image…" : "Paste / drop / import image"}
          </button>
          <span className="text-[11px] leading-snug">
            Attach a table screenshot, add an instruction below, then generate.
          </span>
        </div>
        {imageFile ? (
          <div
            className="mt-3 flex items-center justify-between gap-3 border bg-white px-3 py-2"
            style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
          >
            <span className="min-w-0 truncate text-[12px]">{imageFile.name || "Pasted image"}</span>
            <button
              type="button"
              disabled={busy}
              className="inline-flex size-7 shrink-0 items-center justify-center border bg-white"
              style={{ borderColor: TOK.cardBorder, color: TOK.textPrimary }}
              onClick={() => {
                setImageFile(null);
                setImageErr(null);
              }}
              aria-label="Remove attached image"
            >
              <X className="size-4" aria-hidden strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </div>
      {imageErr ? (
        <p className="mt-2 text-[13px] leading-snug text-[#BC7C3C]" role="alert">
          {imageErr}
        </p>
      ) : null}
      <label className="mt-3 block">
        <span className="sr-only">Prompt</span>
        <textarea
          className={cn(
            "min-h-[88px] w-full resize-y border px-3 py-2 text-[13px] outline-none",
            RAD.outer
          )}
          style={{
            borderColor: TOK.cardBorder,
            background: TOK.pageTint,
            color: TOK.textPrimary,
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={onPasteImage}
          placeholder="e.g. From the attached table, use Avg. columns only. Rows are methods, series are Dir. and E-t-A."
          disabled={busy}
        />
      </label>
      {error && (
        <p
          className="mt-2 text-[13px] leading-snug"
          style={{ color: TOK.textMuted }}
          role="alert"
        >
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={busy || (!message.trim() && !imageFile)}
          className={cn(
            "inline-flex items-center gap-2 border px-4 py-2 text-[13px] font-medium",
            RAD.outer
          )}
          style={{
            borderColor: TOK.textPrimary,
            background:
              busy || (!message.trim() && !imageFile) ? "#f4f4f5" : TOK.textPrimary,
            color: busy || (!message.trim() && !imageFile) ? TOK.textPrimary : "#fff",
          }}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {busy ? "Generating…" : "Generate & apply"}
        </button>
      </div>
    </div>
  );
}
