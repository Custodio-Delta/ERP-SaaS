export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-72 rounded-lg bg-muted" />
        </div>
        <div className="h-8 w-36 rounded-lg bg-muted" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-8 rounded-lg bg-muted" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-7 w-32 rounded bg-muted" />
              <div className="h-3 w-28 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 space-y-1.5">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-3 w-56 rounded bg-muted" />
          </div>
          <div className="h-[300px] w-full rounded-lg bg-muted/50" />
        </div>
        <div className="col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 space-y-1.5">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
          <div className="h-[300px] w-full rounded-lg bg-muted/50" />
        </div>
      </div>

      {/* Recent sales + activity skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>
              <div className="h-4 w-16 rounded bg-muted" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between p-2">
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-4 w-14 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
