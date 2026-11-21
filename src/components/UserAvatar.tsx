"use client";

import { useState } from "react";

interface UserAvatarProps {
  name: string;
  photoURL?: string | null;
  /** Classes for the circular container (size, background, ring, font…). */
  className?: string;
  /** Classes for the image. Defaults to filling the circle. */
  imgClassName?: string;
}

/**
 * One avatar rule for the whole app:
 * - a photo (saved from Google sign-in or uploaded in the app) wins,
 * - a broken/missing photo falls back to the first letter of the name.
 */
export default function UserAvatar({
  name,
  photoURL,
  className = "",
  imgClassName = "size-full rounded-full object-cover",
}: UserAvatarProps) {
  // Track failures per URL. Retry a couple of times (with a cache-buster) before
  // giving up, so a single flaky request doesn't hide a perfectly good photo.
  const [failure, setFailure] = useState<{ url: string; attempts: number } | null>(null);
  const failedForThisUrl = Boolean(failure && failure.url === photoURL);
  const attempts = failure && failure.url === photoURL ? failure.attempts : 0;
  const showPhoto = Boolean(photoURL) && (!failedForThisUrl || attempts < 2);
  const src =
    photoURL && attempts > 0
      ? `${photoURL}${photoURL.includes("?") ? "&" : "?"}_retry=${attempts}`
      : photoURL;
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";

  const handleError = () => {
    if (!photoURL) return;
    setFailure((current) =>
      current?.url === photoURL
        ? { url: photoURL, attempts: current.attempts + 1 }
        : { url: photoURL, attempts: 1 },
    );
  };

  return (
    <span className={`grid place-items-center overflow-hidden rounded-full ${className}`}>
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={name}
          className={imgClassName}
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}
