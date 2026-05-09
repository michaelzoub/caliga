import "server-only";
import { createAnonClient, createServiceClient } from "@/lib/supabase";

export type WritingPost = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  /** Same as subtitle — kept for backwards compat with existing writing page */
  excerpt: string;
  content: string;
  /** Formatted date string for display */
  publishedAt: string;
  writtenBy: string | null;
  coverImageUrl: string | null;
  passwordHash: string | null;
  previewToken: string | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getWritingPosts(): Promise<WritingPost[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      slug: r.slug as string,
      title: r.title as string,
      subtitle: (r.subtitle as string | null) ?? null,
      excerpt: (r.subtitle as string) ?? "",
      content: (r.content as string) ?? "",
      publishedAt: formatDate(r.published_at as string),
      writtenBy: typeof r.written_by === "string" ? r.written_by : null,
      coverImageUrl: typeof r.cover_image_url === "string" ? r.cover_image_url : null,
      passwordHash: typeof r.password_hash === "string" ? r.password_hash : null,
      previewToken: typeof r.preview_token === "string" ? r.preview_token : null,
    };
  });
}

function mapWritingPost(row: Record<string, unknown>, publishedAtFallback = "Preview") {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    subtitle: (row.subtitle as string | null) ?? null,
    excerpt: (row.subtitle as string) ?? "",
    content: (row.content as string) ?? "",
    publishedAt:
      typeof row.published_at === "string"
        ? formatDate(row.published_at)
        : publishedAtFallback,
    writtenBy: typeof row.written_by === "string" ? row.written_by : null,
    coverImageUrl:
      typeof row.cover_image_url === "string" ? row.cover_image_url : null,
    passwordHash:
      typeof row.password_hash === "string" ? row.password_hash : null,
    previewToken: typeof row.preview_token === "string" ? row.preview_token : null,
  };
}

export async function getWritingPostBySlug(slug: string): Promise<WritingPost | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();

  if (error || !data) return null;

  return mapWritingPost(data as Record<string, unknown>);
}

export async function getWritingPostByPreviewToken(
  token: string
): Promise<WritingPost | null> {
  if (!/^[a-f0-9]{48}$/i.test(token)) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("preview_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return mapWritingPost(data as Record<string, unknown>, "Unlisted preview");
}
