import type { ReactNode } from "react";

// Client pages in this area read the session on the client, so navigation is
// allowed to block. `instant` must be exported from a Server Component.
export const instant = false;

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
