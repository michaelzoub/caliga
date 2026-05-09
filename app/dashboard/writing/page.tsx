import type { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase";
import { DeleteButton } from "./DeleteButton";

export const metadata: Metadata = { title: "Writing Dashboard" };
export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardWritingPage() {
  const supabase = createServiceClient();
  const primary = await supabase
    .from("articles")
    .select("id, title, subtitle, slug, published_at, created_at, preview_token, password_hash")
    .order("created_at", { ascending: false });
  let articles: Record<string, unknown>[] | null =
    (primary.data as Record<string, unknown>[] | null) ?? null;
  if (primary.error) {
    const fallback = await supabase
      .from("articles")
      .select("id, title, subtitle, slug, published_at, created_at")
      .order("created_at", { ascending: false });
    articles = (fallback.data as Record<string, unknown>[] | null) ?? null;
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <h1 className="font-sans text-[13px] font-medium text-zinc-900">
          Articles
        </h1>
        <Link
          href="/dashboard/writing/new"
          className="border border-zinc-900 bg-zinc-900 px-4 py-1.5 font-sans text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          New article
        </Link>
      </header>

      <div className="px-6 py-8">
        {!articles || articles.length === 0 ? (
          <p className="font-sans text-sm text-zinc-500">
            No articles yet.{" "}
            <Link
              href="/dashboard/writing/new"
              className="text-cyan-700 underline underline-offset-4 hover:text-cyan-900"
            >
              Create your first one.
            </Link>
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Title
                </th>
                <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Status
                </th>
                <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Created
                </th>
                <th className="pb-3 text-right font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {articles.map((article) => (
                <tr key={article.id as string} className="group">
                  <td className="py-3 pr-6">
                    <span className="font-sans font-medium text-zinc-900">
                      {(article.title as string) || (
                        <span className="italic text-zinc-400">Untitled</span>
                      )}
                    </span>
                    {typeof article.subtitle === "string" && article.subtitle && (
                      <p className="mt-0.5 font-sans text-xs text-zinc-500 line-clamp-1">
                        {article.subtitle}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-6">
                    <span
                      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.12em] ${
                        article.published_at ? "text-cyan-700" : "text-zinc-400"
                      }`}
                    >
                      {article.published_at ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 pr-6 font-mono text-[11px] text-zinc-500">
                    {formatDate(article.created_at as string)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {typeof article.preview_token === "string" ? (
                        <Link
                          href={`/writing/preview/${article.preview_token}`}
                          target="_blank"
                          className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-700 transition-colors hover:text-cyan-900"
                        >
                          Preview
                        </Link>
                      ) : null}
                      {typeof article.password_hash === "string" &&
                      article.password_hash.length > 0 ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                          Locked
                        </span>
                      ) : null}
                      <Link
                        href={`/dashboard/writing/${article.id}`}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={article.id as string} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
