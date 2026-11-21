export default function OwnerDashboardLoading() {
  return (
    <div className="space-y-6" aria-label="Loading owner dashboard" role="status">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-base-200" />
          <div className="h-4 w-80 max-w-[80vw] animate-pulse rounded-lg bg-base-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-36 animate-pulse rounded-lg bg-base-200" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-base-200" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="card-surface space-y-3 p-5">
            <div className="size-10 animate-pulse rounded-xl bg-base-200" />
            <div className="h-4 w-28 animate-pulse rounded-lg bg-base-200" />
            <div className="h-7 w-20 animate-pulse rounded-lg bg-base-200" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card-surface min-h-80 animate-pulse" />
        <div className="card-surface min-h-80 animate-pulse" />
      </div>
      <span className="sr-only">Loading your earnings, rentals and listings.</span>
    </div>
  );
}
