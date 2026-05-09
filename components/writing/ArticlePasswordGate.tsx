import { unlockArticle } from "@/app/writing/access-actions";

export function ArticlePasswordGate({
  articleId,
  title,
  returnTo,
  denied,
}: {
  articleId: string;
  title: string;
  returnTo: string;
  denied: boolean;
}) {
  return (
    <div className="mx-auto max-w-md border border-zinc-200 bg-white p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400">
        Password required
      </p>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-zinc-900">
        {title}
      </h1>
      <form action={unlockArticle} className="mt-6 space-y-4">
        <input type="hidden" name="articleId" value={articleId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
            Article password
          </span>
          <input
            name="password"
            type="password"
            required
            autoFocus
            className="w-full border border-zinc-300 bg-white px-3 py-2.5 font-sans text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-900"
          />
        </label>
        {denied ? (
          <p className="font-sans text-sm text-red-600">
            That password did not unlock this article.
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full border border-zinc-900 bg-zinc-900 px-4 py-2.5 font-sans text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Unlock article
        </button>
      </form>
    </div>
  );
}
