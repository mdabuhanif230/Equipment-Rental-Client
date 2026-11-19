"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { MessageSquare, Star } from "lucide-react";
import Rating from "@/components/Rating";
import EmptyState from "@/components/EmptyState";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { Booking, Review } from "@/lib/types";

interface ReviewSectionProps {
  equipmentId: string;
}

/** Reviews for one equipment item, plus a form when the user finished a rental of it. */
export default function ReviewSection({ equipmentId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [eligibleBookingId, setEligibleBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loading = loadedFor !== equipmentId;

  const loadReviews = useCallback(() => {
    api
      .get<{ items: Review[] }>(`/equipment/${equipmentId}/reviews`)
      .then(({ items }) => setReviews(items))
      .catch(() => setReviews([]))
      .finally(() => setLoadedFor(equipmentId));
  }, [equipmentId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // A review can only be written for a completed, not-yet-reviewed rental
  useEffect(() => {
    if (!user) return;
    let active = true;
    api
      .get<{ items: Booking[] }>("/bookings/my?limit=50")
      .then(({ items }) => {
        if (!active) return;
        const candidate = items.find(
          (b) => String(b.equipmentId) === equipmentId && b.status === "completed",
        );
        if (candidate && !reviews.some((r) => String(r.bookingId) === String(candidate._id))) {
          setEligibleBookingId(candidate._id);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
    // reviews is intentionally not a dependency: eligibility is re-checked after each submit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, equipmentId, reviews.length]);

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!eligibleBookingId) return;
    if (!comment.trim()) {
      toast.error("Please write a short comment.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post<{ item: Review }>("/reviews", {
        bookingId: eligibleBookingId,
        rating,
        comment: comment.trim(),
      });
      toast.success("Thanks for your review!");
      setComment("");
      setEligibleBookingId(null);
      loadReviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post the review.");
    } finally {
      setSubmitting(false);
    }
  };

  const average = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section id="reviews" className="mt-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight">Reviews</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-2 text-sm font-semibold opacity-70">
            <Rating value={average} /> {average.toFixed(1)} · {reviews.length} review
            {reviews.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card-surface h-28 animate-pulse bg-base-200" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="size-6" />}
          title="No reviews yet"
          description="Be the first to review this equipment once your rental is completed."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <li key={review._id} className="card-surface flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <Rating value={review.rating} />
                <span className="text-xs opacity-50">{formatDistanceToNow(review.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed opacity-80">{review.comment}</p>
              <div className="mt-auto flex items-center gap-3 border-base-content/10 pt-3 border-t">
                <span className="bg-primary/15 text-primary grid size-9 place-items-center rounded-full text-xs font-bold uppercase">
                  {review.userName?.charAt(0) || "?"}
                </span>
                <span className="text-sm font-bold">{review.userName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {eligibleBookingId && (
        <form onSubmit={submitReview} className="card-surface mt-6 p-5">
          <h3 className="font-bold">Review your completed rental</h3>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="btn btn-ghost btn-xs btn-circle p-1"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={`size-5 ${
                    n <= (hovered || rating) ? "fill-secondary text-secondary" : "text-base-content/25"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold">{hovered || rating} / 5</span>
          </div>
          <textarea
            rows={3}
            maxLength={1000}
            placeholder="How was the equipment and the handover?"
            className="textarea textarea-bordered mt-3 w-full"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm mt-3 font-bold" disabled={submitting}>
            {submitting ? <span className="loading loading-spinner loading-sm" /> : "Post review"}
          </button>
        </form>
      )}
    </section>
  );
}
