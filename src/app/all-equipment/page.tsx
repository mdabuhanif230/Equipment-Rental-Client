"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import EquipmentCard from "@/components/EquipmentCard";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import type { CategoryCount, Equipment, EquipmentQuery, Paginated, RentalType } from "@/lib/types";

type Sort = NonNullable<EquipmentQuery["sort"]>;

interface Filters {
  search: string;
  location: string;
  category: string;
  rentalType: RentalType | "";
  minPrice: string;
  maxPrice: string;
  available: boolean;
  sort: Sort;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  location: "",
  category: "",
  rentalType: "",
  minPrice: "",
  maxPrice: "",
  available: false,
  sort: "newest",
};

function readFilters(params: URLSearchParams): Filters {
  return {
    search: params.get("search") ?? "",
    location: params.get("location") ?? "",
    category: params.get("category") ?? "",
    rentalType: (params.get("rentalType") as RentalType | null) ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    available: params.get("available") === "true",
    sort: (params.get("sort") as Sort | null) ?? "newest",
  };
}

function buildQuery(filters: Filters, page: number): string {
  const params = new URLSearchParams();
  // The API defaults to 10 results; request enough for the current catalog so
  // all database listings appear together and pagination only returns if it grows.
  params.set("limit", "50");
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.location.trim()) params.set("location", filters.location.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.rentalType) params.set("rentalType", filters.rentalType);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.available) params.set("available", "true");
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

function AllEquipmentInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(() => readFilters(new URLSearchParams(searchParams)), [searchParams]);

  const [filters, setFilters] = useState<Filters>(initial); // live form state (debounced)
  const [committed, setCommitted] = useState<Filters>(initial); // what actually hits the API
  const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [result, setResult] = useState<Paginated<Equipment> | null>(null);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Auto-apply form changes to the server after a short idle pause
  useEffect(() => {
    const timer = setTimeout(() => setCommitted({ ...filters }), 450);
    return () => clearTimeout(timer);
  }, [filters]);

  const query = buildQuery(committed, page);
  const loading = loadedQuery !== query;

  // Single effect: keep the URL shareable AND load page data from the server
  useEffect(() => {
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });

    let active = true;
    api
      .get<Paginated<Equipment>>(`/equipment?${query}`)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setError("");
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load equipment.");
      })
      .finally(() => {
        if (active) setLoadedQuery(query);
      });

    return () => {
      active = false;
    };
  }, [query, pathname, router, retryCount]);

  // Category options for the filter sidebar
  useEffect(() => {
    let active = true;
    api
      .get<{ items: CategoryCount[] }>("/equipment/categories")
      .then(({ items }) => {
        if (active) setCategories(items);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const update = <K extends keyof Filters>(key: K, value: Filters[K], resetPage = true) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (resetPage) setPage(1);
  };

  const resetFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setCommitted({ ...EMPTY_FILTERS });
    setPage(1);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCommitted({ ...filters });
    setPage(1);
  };

  const goToPage = useCallback(
    (next: number) => {
      setPage(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  const activeFilterCount = [
    filters.search,
    filters.location,
    filters.category,
    filters.rentalType,
    filters.minPrice,
    filters.maxPrice,
    filters.available ? "yes" : "",
  ].filter(Boolean).length;

  const filterForm = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-black tracking-wide uppercase opacity-70">
          <SlidersHorizontal className="size-4" /> Filters
        </h2>
        {activeFilterCount > 0 && (
          <button type="button" onClick={resetFilters} className="ui-button ui-button-ghost ui-button-xs gap-1">
            <X className="size-3.5" /> Reset
          </button>
        )}
      </div>

      <label className="ui-form-control">
        <span className="ui-label py-1 text-xs font-semibold opacity-70">Keyword</span>
        <input
          type="search"
          className="ui-input ui-input-bordered ui-input-sm"
          placeholder="e.g. excavator"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
        />
      </label>

      <label className="ui-form-control">
        <span className="ui-label py-1 text-xs font-semibold opacity-70">Location</span>
        <input
          type="text"
          className="ui-input ui-input-bordered ui-input-sm"
          placeholder="e.g. Dhaka"
          value={filters.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </label>

      <label className="ui-form-control">
        <span className="ui-label py-1 text-xs font-semibold opacity-70">Category</span>
        <select
          className="ui-select ui-select-bordered ui-select-sm"
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category} ({c.count})
            </option>
          ))}
        </select>
      </label>

      <label className="ui-form-control">
        <span className="ui-label py-1 text-xs font-semibold opacity-70">Rental type</span>
        <select
          className="ui-select ui-select-bordered ui-select-sm"
          value={filters.rentalType}
          onChange={(e) => update("rentalType", e.target.value as RentalType | "")}
        >
          <option value="">Any type</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="ui-form-control">
          <span className="ui-label py-1 text-xs font-semibold opacity-70">Min price</span>
          <input
            type="number"
            min={0}
            className="ui-input ui-input-bordered ui-input-sm"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => update("minPrice", e.target.value)}
          />
        </label>
        <label className="ui-form-control">
          <span className="ui-label py-1 text-xs font-semibold opacity-70">Max price</span>
          <input
            type="number"
            min={0}
            className="ui-input ui-input-bordered ui-input-sm"
            placeholder="1000"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
          />
        </label>
      </div>

      <label className="ui-label cursor-pointer justify-start gap-3 py-1">
        <input
          type="checkbox"
          className="ui-toggle ui-toggle-primary ui-toggle-sm"
          checked={filters.available}
          onChange={(e) => update("available", e.target.checked)}
        />
        <span className="ui-label-text text-sm font-semibold">Available only</span>
      </label>

      <button type="submit" className="ui-button ui-button-primary ui-button-sm w-full font-bold">
        Apply filters
      </button>
    </form>
  );

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="mb-8 flex flex-col gap-3">
        <span className="eyebrow">Catalogue</span>
        <h1 className="section-title">All Equipment</h1>
        <p className="section-subtitle">
          Search, filter and sort run on the server — every option below is stored in the URL, so
          results are shareable and refresh-safe.
        </p>
      </header>

      <div className="grid items-start gap-7 lg:grid-cols-[290px_1fr]">
        {/* Sidebar (desktop) / collapsible panel (mobile) */}
        <aside className="card-surface sticky top-24 p-5">
          <button
            type="button"
            className="ui-button ui-button-outline ui-button-sm w-full justify-between lg:hidden"
            onClick={() => setMobileFiltersOpen((o) => !o)}
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" /> Filters &amp; sort
            </span>
            <span className="ui-badge ui-badge-primary ui-badge-sm">{activeFilterCount}</span>
          </button>
          <div className={`${mobileFiltersOpen ? "block" : "hidden"} mt-4 lg:mt-0 lg:block`}>
            {filterForm}
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold opacity-70" aria-live="polite">
              {error ? (
                "Catalogue unavailable"
              ) : loading ? (
                "Searching…"
              ) : result ? (
                <>
                  <span className="text-primary font-black">{result.total}</span> equipment found
                  {page > 1 && ` · page ${result.page} of ${result.pages}`}
                </>
              ) : (
                "No results"
              )}
            </p>

            <label className="flex items-center gap-2 text-sm font-semibold">
              <span className="opacity-60">Sort by</span>
              <select
                className="ui-select ui-select-bordered ui-select-sm"
                value={filters.sort}
                onChange={(e) => update("sort", e.target.value as Sort)}
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-surface aspect-4/3 animate-pulse bg-base-200" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="Equipment catalogue unavailable"
              description={error}
              action={
                <button
                  type="button"
                  className="ui-button ui-button-primary ui-button-sm mt-2"
                  onClick={() => {
                    setLoadedQuery(null);
                    setRetryCount((count) => count + 1);
                  }}
                >
                  Try again
                </button>
              }
            />
          ) : result && result.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((item, i) => (
                  <EquipmentCard key={item._id} item={item} index={i} />
                ))}
              </div>
              <Pagination page={result.page} pages={result.pages} onChange={goToPage} busy={loading} />
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="No equipment matches those filters"
              description="Try widening the price range, clearing the location, or browsing every category."
              action={
                <button type="button" onClick={resetFilters} className="ui-button ui-button-primary ui-button-sm mt-2">
                  Reset filters
                </button>
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

export default function AllEquipmentPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-16">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-surface aspect-4/3 animate-pulse bg-base-200" />
            ))}
          </div>
        </div>
      }
    >
      <AllEquipmentInner />
    </Suspense>
  );
}
