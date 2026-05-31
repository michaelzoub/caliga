import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase";
import ArticleEditor from "@/components/editor/ArticleEditor";
import {
  DashboardErrorPanel,
  dashboardErrorMessage,
} from "@/components/dashboard/DashboardErrorPanel";

export const metadata: Metadata = { title: "Edit Article — Dashboard" };

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  let article: Record<string, unknown> | null = null;

  try {
    const supabase = createServiceClient();
    const result = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (result.error) throw result.error;
    article = result.data as Record<string, unknown> | null;
  } catch (error) {
    return (
      <DashboardErrorPanel
        title="Article failed to load"
        detail={dashboardErrorMessage(error)}
      />
    );
  }

  if (!article) notFound();

  return (
    <ArticleEditor
      initialId={article.id as string}
      initialTitle={(article.title as string) ?? ""}
      initialSubtitle={(article.subtitle as string) ?? ""}
      initialContent={(article.content as string) ?? ""}
      initialSlug={(article.slug as string) ?? ""}
      initialWrittenBy={
        typeof article.written_by === "string" ? article.written_by : ""
      }
      initialCoverImageUrl={
        typeof article.cover_image_url === "string" ? article.cover_image_url : ""
      }
      initialPreviewToken={
        typeof article.preview_token === "string" ? article.preview_token : ""
      }
      initialHasPassword={typeof article.password_hash === "string" && article.password_hash.length > 0}
    />
  );
}
