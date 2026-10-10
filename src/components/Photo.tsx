"use client";
import { useState } from "react";

/**
 * A photograph with a licensed stock fallback. The salon's Google Business
 * Profile images can expire or be blocked; this guarantees a reviewer never
 * sees a broken image icon.
 */
export function Photo({
  src, fallback, alt, className = "", priority = false,
}: { src: string; fallback: string; alt: string; className?: string; priority?: boolean }) {
  const [current, setCurrent] = useState(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      onError={() => { if (current !== fallback) setCurrent(fallback); }}
    />
  );
}
