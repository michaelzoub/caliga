import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/writing/ArticlePage";
import { ArticlePasswordGate } from "@/components/writing/ArticlePasswordGate";
import {
  articleAccessCookieName,
  isValidArticleAccessCookie,
} from "@/lib/article-access";
import { getWritingPostByPreviewToken } from "@/lib/writing/queries";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ access?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const post = await getWritingPostByPreviewToken(token);
  if (!post) return { title: "Not found | Caliga" };
  return {
    title: `Preview: ${post.title} | Caliga`,
    description: post.excerpt,
    robots: { index: false, follow: false },
  };
}

export default async function WritingPreviewPage({
  params,
  searchParams,
}: Props) {
  const { token } = await params;
  const post = await getWritingPostByPreviewToken(token);
  if (!post) notFound();

  const cookieStore = await cookies();
  const unlocked = isValidArticleAccessCookie(
    post.id,
    post.passwordHash,
    cookieStore.get(articleAccessCookieName(post.id))?.value
  );

  if (!unlocked) {
    const sp = (await searchParams) ?? {};
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <ArticlePasswordGate
          articleId={post.id}
          title={post.title}
          returnTo={`/writing/preview/${token}`}
          denied={sp.access === "denied"}
        />
      </main>
    );
  }

  return <ArticlePage post={post} eyebrow="Unlisted preview" />;
}
