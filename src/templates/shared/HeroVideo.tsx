"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Muted, inline background loop with an immediate poster and a pause control (brief H01, T08).
 * Autoplay is skipped for reduced-motion and data-saver users; they keep the poster.
 */
export function HeroVideo({
  src, poster, className = "", buttonClassName = "",
}: { src: string; poster?: string; className?: string; buttonClassName?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    // Gate autoplay on a client-only media query; this is the external-system sync effects are for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllowed(!reduce && !saveData);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !allowed) return;
    v.play().then(() => setPlaying(true), () => setPlaying(false));
  }, [allowed]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true), () => undefined);
    else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <video
        ref={ref}
        className={className}
        poster={poster}
        muted
        loop
        playsInline
        preload={allowed ? "auto" : "none"}
        aria-hidden="true"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      >
        {allowed && <source src={src} type="video/mp4" />}
      </video>
      {allowed && (
        <button type="button" onClick={toggle} className={buttonClassName} aria-pressed={!playing} aria-label={playing ? "Pause background video" : "Play background video"}>
          {playing ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2h3v12H4zM9 2h3v12H9z" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 2l10 6-10 6z" /></svg>
          )}
        </button>
      )}
    </>
  );
}
