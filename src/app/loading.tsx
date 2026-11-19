import Logo from "@/components/Logo";

/** Full-page loading state (route-level loading.tsx). */
export default function Loading() {
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="flex flex-col items-center gap-5">
        <span className="animate-pulse">
          <Logo />
        </span>
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm font-medium opacity-60">Loading the best gear for you…</p>
      </div>
    </div>
  );
}
