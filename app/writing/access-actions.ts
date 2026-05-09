"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import {
  articleAccessCookieName,
  articleAccessCookieValue,
  verifyArticlePassword,
} from "@/lib/article-access";

export async function unlockArticle(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  const password = String(formData.get("password") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/writing");

  if (!articleId || !password) {
    redirect(`${returnTo}?access=missing`);
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("articles")
    .select("id, password_hash")
    .eq("id", articleId)
    .maybeSingle();

  const passwordHash =
    data && typeof data.password_hash === "string" ? data.password_hash : null;

  if (!data || !passwordHash || !verifyArticlePassword(password, passwordHash)) {
    redirect(`${returnTo}?access=denied`);
  }

  const cookieStore = await cookies();
  cookieStore.set(
    articleAccessCookieName(articleId),
    articleAccessCookieValue(articleId, passwordHash),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  );

  redirect(returnTo);
}
