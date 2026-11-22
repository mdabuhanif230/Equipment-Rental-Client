"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID =
  "149283216581-vjliqf2ebqkaqqu5mhrsf435uk8hfep8.apps.googleusercontent.com";
const dashboardPath: Record<Role, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        use_fedcm_for_button: boolean;
        button_auto_select: boolean;
      }) => void;
      renderButton: (
        element: HTMLElement,
        options: {
          type: "standard";
          theme: "outline";
          size: "large";
          shape: "rectangular";
          logo_alignment: "left";
          text: "continue_with" | "signup_with";
          width: number;
        },
      ) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
    __rentgearGoogleInitKey?: string;
    __rentgearGoogleCredentialHandler?: ((credential: string) => void) | null;
  }
}

export default function GoogleLoginButton({
  text = "continue_with",
  signupRole,
}: {
  text?: "continue_with" | "signup_with";
  signupRole?: Exclude<Role, "admin">;
}) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [showSetupHint, setShowSetupHint] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
  const busyRef = useRef(false);
  const needsSignupRole = text === "signup_with";
  const canContinue = !needsSignupRole || Boolean(signupRole);

  const handleCredential = useCallback(async (credential: string) => {
    if (needsSignupRole && !signupRole) {
      toast.error("Choose your role before signing up with Google.");
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const user = await loginWithGoogle(credential, signupRole);
      router.replace(dashboardPath[user.role]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [loginWithGoogle, needsSignupRole, router, signupRole]);
  const handleCredentialRef = useRef(handleCredential);

  useEffect(() => {
    handleCredentialRef.current = handleCredential;
  }, [handleCredential]);

  useEffect(() => {
    if (!clientId || !canContinue) return;
    let cancelled = false;
    let script: HTMLScriptElement | null = null;
    const currentCredentialHandler = (credential: string) => {
      handleCredentialRef.current(credential);
    };
    window.__rentgearGoogleCredentialHandler = currentCredentialHandler;

    const renderGoogleButton = () => {
      const element = buttonRef.current;
      if (cancelled || !element || !window.google) return;
      // Use the standard Google account-chooser page instead of Chrome's compact FedCM dialog.
      // Re-initialize whenever these options change (e.g. after a hot reload).
      const initKey = `${clientId}|fedcm:false`;
      if (window.__rentgearGoogleInitKey !== initKey) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          use_fedcm_for_button: false,
          button_auto_select: false,
          callback: ({ credential }) => {
            if (credential) window.__rentgearGoogleCredentialHandler?.(credential);
            else toast.error("Google did not return a sign-in credential.");
          },
        });
        window.__rentgearGoogleInitKey = initKey;
      }
      element.replaceChildren();
      window.google.accounts.id.renderButton(element, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        logo_alignment: "left",
        text,
        width: Math.min(400, Math.max(120, Math.floor(element.getBoundingClientRect().width))),
      });
    };
    const handleScriptError = () => {
      if (!cancelled) setScriptFailed(true);
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
      if (!script) {
        script = document.createElement("script");
        script.src = GOOGLE_IDENTITY_SCRIPT;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", renderGoogleButton);
      script.addEventListener("error", handleScriptError);
    }

    return () => {
      cancelled = true;
      if (window.__rentgearGoogleCredentialHandler === currentCredentialHandler) {
        window.__rentgearGoogleCredentialHandler = null;
      }
      script?.removeEventListener("load", renderGoogleButton);
      script?.removeEventListener("error", handleScriptError);
    };
  }, [canContinue, clientId, text]);

  return (
    <div className="w-full">
      {clientId && canContinue ? (
        <>
          <div ref={buttonRef} className="flex min-h-11 w-full justify-center" aria-busy={busy} />
          {busy && <p className="mt-2 text-center text-xs text-base-content/65" role="status">Connecting to Google…</p>}
          {scriptFailed && (
            <p className="mt-2 text-center text-xs text-error" role="alert">
              Google sign-in could not load. Check your connection and try again.
            </p>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!canContinue) return;
            setShowSetupHint(true);
          }}
          disabled={!canContinue}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>
            {!canContinue
              ? "Choose a role above to sign up with Google"
              : text === "signup_with"
                ? "Sign up with Google"
                : "Continue with Google"}
          </span>
        </button>
      )}
      {showSetupHint && (
        <p className="mt-2 text-center text-xs leading-relaxed text-base-content/65" role="status">
          Google sign-in needs the same OAuth Web Client ID in the client and server environments. Restart both apps after configuring it.
        </p>
      )}
    </div>
  );
}
