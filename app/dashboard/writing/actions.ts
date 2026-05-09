"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase";
import { createPreviewToken, hashArticlePassword } from "@/lib/article-access";

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("dashboard_token")?.value;
  if (token !== process.env.DASHBOARD_SECRET) {
    redirect("/dashboard/login");
  }
}

/** Before migrations, PostgREST rejects unknown columns — retry without them. */
function isMissingOptionalArticleColumnError(err: { message?: string } | null): boolean {
  const m = (err?.message ?? "").toLowerCase();
  const optionalColumns = [
    "written_by",
    "cover_image_url",
    "preview_token",
    "password_hash",
  ];
  if (!optionalColumns.some((col) => m.includes(col))) return false;
  return (
    m.includes("schema cache") ||
    m.includes("does not exist") ||
    m.includes("unknown") ||
    m.includes("column")
  );
}

export async function saveDraft(data: {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  slug: string;
  writtenBy: string;
  coverImageUrl: string;
  articlePassword?: string;
  clearArticlePassword?: boolean;
}): Promise<{ id: string; previewToken?: string } | null> {
  await requireAuth();
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const byline = {
    written_by: data.writtenBy.trim() || null,
    cover_image_url: data.coverImageUrl.trim() || null,
  };
  const access = {
    ...(data.articlePassword?.trim()
      ? { password_hash: hashArticlePassword(data.articlePassword.trim()) }
      : {}),
    ...(data.clearArticlePassword ? { password_hash: null } : {}),
  };

  if (data.id) {
    const core = {
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      slug: data.slug,
      published_at: null,
      updated_at: now,
    };
    let { error } = await supabase.from("articles").update({ ...core, ...byline, ...access }).eq("id", data.id);
    if (error && isMissingOptionalArticleColumnError(error)) {
      ({ error } = await supabase.from("articles").update(core).eq("id", data.id));
    }
    if (error) throw new Error(error.message);
    revalidatePath("/dashboard/writing");
    return { id: data.id };
  }

  const coreInsert = {
    title: data.title,
    subtitle: data.subtitle || null,
    content: data.content,
    slug: data.slug,
    published_at: null as string | null,
  };
  let { data: inserted, error } = await supabase
    .from("articles")
    .insert({ ...coreInsert, ...byline, ...access, preview_token: createPreviewToken() })
    .select("id, preview_token")
    .single();
  if (error && isMissingOptionalArticleColumnError(error)) {
    ({ data: inserted, error } = await supabase
      .from("articles")
      .insert(coreInsert)
      .select("id")
      .single());
  }
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/writing");
  const row = inserted as { id: string; preview_token?: string | null } | null;
  return row ? { id: row.id, previewToken: row.preview_token ?? undefined } : null;
}

export async function publishArticle(data: {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  slug: string;
  writtenBy: string;
  coverImageUrl: string;
  articlePassword?: string;
  clearArticlePassword?: boolean;
}): Promise<{ redirectTo: string }> {
  await requireAuth();
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const byline = {
    written_by: data.writtenBy.trim() || null,
    cover_image_url: data.coverImageUrl.trim() || null,
  };
  const access = {
    ...(data.articlePassword?.trim()
      ? { password_hash: hashArticlePassword(data.articlePassword.trim()) }
      : {}),
    ...(data.clearArticlePassword ? { password_hash: null } : {}),
  };

  let id = data.id;

  if (id) {
    const core = {
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      slug: data.slug,
      published_at: now,
      updated_at: now,
    };
    let { error } = await supabase.from("articles").update({ ...core, ...byline, ...access }).eq("id", id);
    if (error && isMissingOptionalArticleColumnError(error)) {
      ({ error } = await supabase.from("articles").update(core).eq("id", id));
    }
    if (error) throw new Error(error.message);
  } else {
    const coreInsert = {
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      slug: data.slug,
      published_at: now,
    };
    let { data: inserted, error } = await supabase
      .from("articles")
      .insert({ ...coreInsert, ...byline, ...access, preview_token: createPreviewToken() })
      .select("id")
      .single();
    if (error && isMissingOptionalArticleColumnError(error)) {
      ({ data: inserted, error } = await supabase
        .from("articles")
        .insert(coreInsert)
        .select("id")
        .single());
    }
    if (error) throw new Error(error.message);
    id = (inserted as { id: string } | null)?.id;
  }

  if (!id) {
    throw new Error("Publish failed: no article id returned.");
  }

  revalidatePath("/writing");
  revalidatePath("/dashboard/writing");
  return { redirectTo: `/dashboard/writing/${id}/publish-success` };
}

export async function deleteArticle(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  if (!id) return;
  const supabase = createServiceClient();
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/dashboard/writing");
  revalidatePath("/writing");
}
