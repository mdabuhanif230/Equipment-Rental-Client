"use client";

import Image from "next/image";
import Link from "next/link";
import { use, Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Heart,
  Mail,
  MapPin,
  PackageOpen,
  PencilRuler,
  ShieldCheck,
  Tag,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import BookingModal from "@/components/equipment/BookingModal";
import ReviewSection from "@/components/equipment/ReviewSection";
import UserAvatar from "@/components/UserAvatar";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { Equipment } from "@/lib/types";

function EquipmentDetails({ id }: { id: string }) {
  const { user } = useAuth();
  const [item, setItem] = useState<Equipment | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [toggling, setToggling] = useState(false);

  const loading = loadedId !== id;

  useEffect(() => {
    let active = true;
    api
      .get<{ item: Equipment }>(`/equipment/${id}`)
      .then(({ item }) => {
        if (!active) return;
        setItem(item);
        setError("");
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Equipment not found.");
      })
      .finally(() => {
        if (active) setLoadedId(id);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Favorite state for the signed-in customer
  useEffect(() => {
    if (user?.role !== "customer") return;
    let active = true;
    api
      .get<{ ids: string[] }>("/favorites/ids")
      .then(({ ids }) => {
        if (active) setIsFavorite(ids.includes(id));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to save favorites.");
      return;
    }
    setToggling(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
        toast.success("Removed from favorites.");
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
        toast.success("Added to favorites.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update favorites.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="aspect-video w-full animate-pulse rounded-3xl bg-base-200" />
        <div className="h-80 animate-pulse rounded-3xl bg-base-200" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container-page grid min-h-[50vh] place-items-center py-16">
        <div className="card-surface max-w-md p-8 text-center">
          <PackageOpen className="text-primary mx-auto size-12" />
          <h1 className="mt-4 text-xl font-extrabold">Equipment unavailable</h1>
          <p className="mt-2 text-sm opacity-70">{error || "This listing could not be loaded."}</p>
          <Link href="/all-equipment" className="ui-button ui-button-primary ui-button-sm mt-5">
            Browse other equipment
          </Link>
        </div>
      </div>
    );
  }

  const unitLabel =
    item.rentalType === "Daily" ? "day" : item.rentalType === "Weekly" ? "week" : "month";

  const specs = [
    { icon: Tag, label: "Category", value: item.category },
    { icon: PencilRuler, label: "Condition", value: item.condition },
    { icon: Building2, label: "Brand / Model", value: `${item.brand} ${item.model}` },
    { icon: MapPin, label: "Location", value: item.location },
    { icon: CalendarDays, label: "Available since", value: formatDate(item.createdAt) },
    { icon: ShieldCheck, label: "Status", value: item.status },
  ];

  return (
    <div className="container-page py-8 lg:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm opacity-70">
        <Link href="/" className="flex items-center gap-1 hover:text-primary">
          <ArrowLeft className="size-4" /> Home
        </Link>
        <span>/</span>
        <Link href="/all-equipment" className="hover:text-primary">
          All Equipment
        </Link>
        <span>/</span>
        <span className="truncate font-semibold opacity-100">{item.name}</span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-[1.45fr_1fr]">
        {/* main column */}
        <div className="flex flex-col gap-6">
          <div className="card-surface overflow-hidden">
            <div className="relative aspect-video">
              {item.image?.startsWith("http") ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- local PNG fallback
                <img src="/images/placeholder.png" alt={item.name} className="h-full w-full object-cover" />
              )}
              <span className="ui-badge ui-badge-primary absolute top-4 left-4 font-semibold text-primary-content">
                {item.category}
              </span>
              <span
                className={`ui-badge absolute top-4 right-4 font-bold ${
                  item.quantity > 0 ? "ui-badge-success" : "ui-badge-error"
                }`}
              >
                {item.quantity > 0 ? `${item.quantity} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{item.name}</h1>
                  <p className="mt-2 flex items-center gap-2 text-sm opacity-65">
                    <MapPin className="size-4" /> {item.location} · Listed by {item.ownerName}
                  </p>
                </div>
                {user?.role === "customer" && (
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={toggling}
                    className={`ui-button ui-button-sm gap-2 ${
                      isFavorite ? "ui-button-error text-error-content" : "ui-button-outline"
                    }`}
                    aria-pressed={isFavorite}
                  >
                    <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
                    {isFavorite ? "Saved" : "Add to favorites"}
                  </button>
                )}
              </div>

              <p className="mt-5 leading-relaxed opacity-80">{item.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-base-200 rounded-xl p-3.5">
                    <p className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase opacity-55">
                      <spec.icon className="size-3.5" /> {spec.label}
                    </p>
                    <p className="mt-1.5 truncate text-sm font-bold capitalize">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-base-200/70 mt-6 rounded-2xl p-4">
                <h2 className="text-base font-bold">Owner information</h2>
                <div className="mt-3 flex items-center gap-3">
                  <UserAvatar
                    name={item.ownerName || "O"}
                    photoURL={item.ownerPhoto}
                    className="bg-primary/15 text-primary grid size-11 shrink-0 place-items-center rounded-full font-black uppercase"
                    imgClassName="size-11 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.ownerName}</p>
                    {item.ownerEmail && (
                      <p className="flex items-center gap-1.5 truncate text-xs opacity-65">
                        <Mail className="size-3.5 shrink-0" /> {item.ownerEmail}
                      </p>
                    )}
                    <p className="mt-1 flex items-center gap-1.5 text-xs opacity-55">
                      <ShieldCheck className="size-3.5 shrink-0 text-primary" /> Verified equipment owner
                    </p>
                  </div>
                </div>
              </div>

              {item.rentalTerms && (
                <div className="mt-6">
                  <h2 className="text-base font-bold">Rental terms</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed opacity-75">
                    {item.rentalTerms}
                  </p>
                </div>
              )}
            </div>
          </div>

          <ReviewSection equipmentId={item._id} />
        </div>

        {/* booking column */}
        <aside className="card-surface sticky top-24 flex flex-col gap-5 p-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase opacity-55">Price</p>
            <p className="mt-1 text-4xl font-black text-primary">
              {formatCurrency(item.price)}
              <span className="text-sm font-semibold opacity-60"> /{unitLabel}</span>
            </p>
            <p className="mt-2 text-sm opacity-65">
              Billed by {item.rentalType.toLowerCase()} rental — minimum one {unitLabel}.
            </p>
          </div>

          <div className="bg-base-200 rounded-2xl p-4 text-sm">
            <p className="flex items-center justify-between gap-2">
              <span className="opacity-60">Units available</span>
              <span className="font-bold">{item.quantity}</span>
            </p>
            <p className="mt-2 flex items-center justify-between gap-2">
              <span className="opacity-60">Listing status</span>
              <span className={`ui-badge ui-badge-sm capitalize ${
                item.status === "approved" ? "ui-badge-success" : "ui-badge-warning"
              }`}>
                {item.status}
              </span>
            </p>
            <p className="mt-2 flex items-center justify-between gap-2">
              <span className="opacity-60">Payment</span>
              <span className="font-bold">Stripe Checkout</span>
            </p>
          </div>

          {user?.role === "customer" ? (
            <button
              type="button"
              className="ui-button ui-button-primary w-full font-bold"
              onClick={() => setBookingOpen(true)}
              disabled={item.quantity < 1}
            >
              {item.quantity < 1 ? "Currently unavailable" : "Book this equipment"}
            </button>
          ) : (
            <p className="rounded-xl bg-base-200 p-3 text-center text-sm opacity-70">Customer accounts can book equipment.</p>
          )}

          <Link href="#reviews" className="ui-button ui-button-outline ui-button-sm w-full">
            Read reviews
          </Link>

          <div className="border-base-content/10 flex items-start gap-3 border-t pt-4 text-xs leading-relaxed opacity-70">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Payments are processed by Stripe and verified on the server. Your booking is held for
              35 minutes while you complete checkout.
            </p>
          </div>
        </aside>
      </div>

      {bookingOpen && <BookingModal item={item} onClose={() => setBookingOpen(false)} />}
    </div>
  );
}

export default function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="ui-loading ui-loading-spinner ui-loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard>
        <EquipmentDetails id={id} />
      </AuthGuard>
    </Suspense>
  );
}
