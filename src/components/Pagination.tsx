"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
  busy?: boolean;
}

/** Shared paginator used by the equipment list and every dashboard table. */
export default function Pagination({ page, pages, onChange, busy = false }: PaginationProps) {
  if (pages <= 1) return null;

  const windowed: number[] = [];
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  for (let p = start; p <= end; p++) windowed.push(p);

  return (
    <nav className="mt-6 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        className="ui-button ui-button-outline ui-button-sm ui-button-circle"
        disabled={page <= 1 || busy}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {start > 1 && (
        <>
          <button type="button" className="ui-button ui-button-ghost ui-button-sm min-w-9" onClick={() => onChange(1)}>
            1
          </button>
          {start > 2 && <span className="px-1 opacity-50">…</span>}
        </>
      )}

      {windowed.map((p) => (
        <button
          key={p}
          type="button"
          className={`ui-button ui-button-sm min-w-9 ${p === page ? "ui-button-primary" : "ui-button-ghost"}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-1 opacity-50">…</span>}
          <button
            type="button"
            className="ui-button ui-button-ghost ui-button-sm min-w-9"
            onClick={() => onChange(pages)}
          >
            {pages}
          </button>
        </>
      )}

      <button
        type="button"
        className="ui-button ui-button-outline ui-button-sm ui-button-circle"
        disabled={page >= pages || busy}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
