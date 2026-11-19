import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[75vh] place-items-center px-4">
      <div className="text-center">
        <p className="brand-text text-[7rem] leading-none font-black sm:text-[10rem]">404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed opacity-70">
          The page you are looking for does not exist or may have been moved. Let&apos;s get you
          back to renting great equipment.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary gap-2 px-6">
            <Home className="size-4" /> Go Home
          </Link>
          <Link href="/all-equipment" className="btn btn-outline gap-2 px-6">
            <Compass className="size-4" /> Browse Equipment
          </Link>
        </div>
      </div>
    </div>
  );
}
