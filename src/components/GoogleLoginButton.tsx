"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

/**
 * Google social login using Google Identity Services.
 * The id_token is posted to POST /api/auth/google on the server.
 */
export default function GoogleLoginButton({ text = "continue_with" }: { text?: string }) {
  const { loginWithGoogle } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const handleCredential = async (response: { credential: string }) => {
      try {
        await loginWithGoogle(response.credential);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      }
    };

    const render = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: 340,
        text,
        shape: "rectangular",
      });
      setReady(true);
    };

    if (window.google) {
      render();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [clientId, loginWithGoogle, text]);

  if (!clientId) {
    return (
      <div className="alert alert-ghost text-xs">
        Set <code className="font-bold">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in .env.local to enable
        Google sign-in.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="min-h-10" />
      {!ready && <span className="loading loading-spinner loading-sm text-primary" />}
    </div>
  );
}
