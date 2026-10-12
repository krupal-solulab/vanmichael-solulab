"use client";
import { useEffect, useRef, useState } from "react";

/**
 * <img> that degrades to a neutral panel instead of a broken-image icon.
 * Checks `complete && naturalWidth === 0` after hydration because an image can
 * fail before React attaches its onError handler (a gap in the reference build).
 */
export function SmartImg({
  src, alt, className = "", priority = false, sizes, fallbackClassName = "",
}: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string; fallbackClassName?: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (failed) return <div role="img" aria-label={alt} className={`${className} ${fallbackClassName}`} />;
  return (
    // Images come from many hosts (Google, booking CDNs, stock); next/image would need each allow-listed.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      sizes={sizes}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
