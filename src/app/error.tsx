"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/** Global error boundary shown when a route throws. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 py-20">
      <div className="card-surface max-w-lg p-8 text-center shadow-sm">
        <span className="ui-badge ui-badge-error ui-badge-outline mb-5 gap-2 font-bold">
          <AlertTriangle className="size-4" /> Something broke
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">Unexpected application error</h1>
        <p className="mt-3 text-sm leading-relaxed opacity-70">
          {error.message || "An unknown error occurred while rendering this page."}
        </p>
        {error.digest && <p className="font-mono text-xs opacity-50">Ref: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="ui-button ui-button-primary ui-button-sm gap-2">
            <RefreshCw className="size-4" /> Try again
          </button>
          <Link href="/" className="ui-button ui-button-outline ui-button-sm gap-2">
            <Home className="size-4" /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
