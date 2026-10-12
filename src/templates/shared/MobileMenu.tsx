"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Disclosure for the small-screen nav: Escape closes, focus returns to the toggle, route changes close it. */
export function MobileMenu({
  children, buttonClassName = "", panelClassName = "", label = "Menu",
}: { children: ReactNode; buttonClassName?: string; panelClassName?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close on navigation (adjusting state during render, per React guidance).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button ref={button} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className={buttonClassName}>
        <span className="sr-only">{open ? "Close menu" : label}</span>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          {open ? (
            <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M4 8h16M4 16h16" />
          )}
        </svg>
      </button>
      <div ref={panel} id={id} hidden={!open} className={panelClassName}>
        {children}
      </div>
    </>
  );
}
