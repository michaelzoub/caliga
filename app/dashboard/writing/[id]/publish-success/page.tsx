import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase";
import PublishSuccessActions from "@/components/editor/PublishSuccessActions";
import {
  DashboardErrorPanel,
  dashboardErrorMessage,
} from "@/components/dashboard/DashboardErrorPanel";

export const metadata: Metadata = { title: "Published — Dashboard" };

type Props = { params: Promise<{ id: string }> };

export default async function PublishSuccessPage({ params }: Props) {
  const { id } = await params;
  let article: Record<string, unknown> | null = null;

  try {
    const supabase = createServiceClient();
    const primary = await supabase
      .from("articles")
      .select("id, title, subtitle, content, slug, published_at, preview_token")
      .eq("id", id)
      .maybeSingle();
    article = primary.data as Record<string, unknown> | null;
    if (primary.error) {
      const fallback = await supabase
        .from("articles")
        .select("id, title, subtitle, content, slug, published_at")
        .eq("id", id)
        .maybeSingle();
      if (fallback.error) throw fallback.error;
      article = fallback.data as Record<string, unknown> | null;
    }
  } catch (error) {
    return (
      <DashboardErrorPanel
        title="Published article failed to load"
        detail={dashboardErrorMessage(error)}
      />
    );
  }

  if (!article || !article.published_at) notFound();

  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center gap-4 border-b border-zinc-200 px-6 py-4">
        <Link
          href="/dashboard/writing"
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ← All articles
        </Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-700">
          Published
        </p>
        <h1 className="mb-2 font-sans text-2xl font-semibold text-zinc-900">
          {article.title as string}
        </h1>
        {typeof article.subtitle === "string" && article.subtitle && (
          <p className="mb-10 font-sans text-base text-zinc-600">
            {article.subtitle}
          </p>
        )}

        <div className="mb-10 border-t border-zinc-200" />

        <PublishSuccessActions
          html={article.content as string}
          slug={article.slug as string}
          previewToken={
            typeof article.preview_token === "string" ? article.preview_token : ""
          }
        />

        <div className="mt-10 border-t border-zinc-200 pt-8">
          <Link
            href={`/dashboard/writing/${id}`}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Edit article →
          </Link>
        </div>
      </div>
    </main>
  );
}
