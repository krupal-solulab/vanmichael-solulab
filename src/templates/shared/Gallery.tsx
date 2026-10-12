"use client";
import { useEffect, useRef, useState } from "react";
import type { Img } from "../content";
import { SmartImg } from "./SmartImg";

/**
 * Gallery grid + keyboard-operable lightbox on a native <dialog>
 * (focus trapping, Escape and focus return come from the platform).
 * Two compositions so the families do not share a DOM (brief §10).
 */
export function Gallery({ images, layout }: { images: Img[]; layout: "atelier" | "editorial" }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));

  const open = (i: number, el: HTMLButtonElement) => {
    opener.current = el;
    setIndex(i);
  };

  const grid =
    layout === "atelier" ? (
      <ul className="grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-3 md:gap-3">
        {images.map((img, i) => (
          <li key={img.src} className={i % 5 === 0 ? "col-span-2 row-span-2" : ""}>
            <button type="button" onClick={(e) => open(i, e.currentTarget)} className="group relative block aspect-square w-full overflow-hidden bg-char-2">
              <SmartImg src={img.src} alt={img.alt} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]" />
              <span className="sr-only">Open larger view</span>
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <ul className="columns-2 gap-4 p-0 md:columns-3 [&>li]:mb-4">
        {images.map((img, i) => (
          <li key={img.src} className="list-none break-inside-avoid">
            <figure className="m-0">
              <button type="button" onClick={(e) => open(i, e.currentTarget)} className={`block w-full overflow-hidden rounded-2xl bg-blush ${i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                <SmartImg src={img.src} alt={img.alt} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
                <span className="sr-only">Open larger view</span>
              </button>
              {img.credit && <figcaption className="mt-2 text-xs text-muted">{img.credit.text}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
    );

  const current = index === null ? null : images[index];

  return (
    <>
      {grid}
      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        onClose={() => {
          setIndex(null);
          opener.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        onClick={(e) => e.target === e.currentTarget && setIndex(null)}
        className="m-auto max-h-[92vh] w-[min(1100px,94vw)] bg-transparent p-0 backdrop:bg-black/85"
      >
        {current && (
          <figure className="m-0 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.alt} className="max-h-[78vh] w-auto max-w-full object-contain" referrerPolicy="no-referrer" />
            <figcaption className="flex w-full flex-wrap items-center justify-between gap-3 text-sm text-white/80">
              <span>
                {index! + 1} / {images.length}
                {current.credit && <> · {current.credit.text}</>}
              </span>
              <span className="flex gap-2">
                <button type="button" onClick={() => step(-1)} className="rounded-full border border-white/40 px-4 py-2 text-white hover:bg-white/10">Previous</button>
                <button type="button" onClick={() => step(1)} className="rounded-full border border-white/40 px-4 py-2 text-white hover:bg-white/10">Next</button>
                <button type="button" onClick={() => setIndex(null)} className="rounded-full bg-white px-4 py-2 text-black">Close</button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
