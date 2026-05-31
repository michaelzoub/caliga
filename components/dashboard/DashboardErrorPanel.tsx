import Link from "next/link";

export function DashboardErrorPanel({
  title = "Dashboard data failed to load",
  detail,
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto max-w-2xl border border-zinc-200 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#BC7C3C]">
          Server render error
        </p>
        <h1 className="mt-3 font-sans text-2xl font-semibold text-[#111111]">
          {title}
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[#111111]">
          {detail ||
            "The dashboard could not reach its server-side data source. Check production environment variables and Supabase connectivity."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex border border-[#111111] bg-[#111111] px-4 py-2 font-sans text-xs font-medium text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}

export function dashboardErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown server error.";
}
