export function Rating({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <p className="flex items-center gap-2 text-[13.5px] text-soft">
      <span aria-hidden="true" className="tracking-[1.5px] text-gold">★★★★★</span>
      <span>
        <b className="font-semibold text-ink">{rating}</b> · {reviews.toLocaleString("en-US")} Google reviews
      </span>
    </p>
  );
}
