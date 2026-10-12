"use client";
import { forwardRef, type ReactNode } from "react";

export type Variant = "atelier" | "editorial";

export function dialogSkin(variant: Variant) {
  return variant === "atelier"
    ? {
        panel: "bg-char text-ivory sm:border sm:border-ivory/15",
        bar: "border-b border-ivory/10",
        foot: "border-t border-ivory/10 text-ivory/75",
        title: "font-a-display text-[22px] font-light",
        close: "border border-ivory/30 text-ivory hover:bg-ivory hover:text-char",
        body: "bg-ivory text-char",
        spinner: "border-char/20 border-t-char",
        link: "underline decoration-champ/60 underline-offset-4",
      }
    : {
        panel: "bg-card text-ink sm:rounded-[28px]",
        bar: "border-b border-line",
        foot: "border-t border-line text-muted",
        title: "font-e-display text-[18px] font-bold tracking-[-.01em]",
        close: "rounded-full border border-line hover:border-ink",
        body: "bg-white text-ink",
        spinner: "border-ink/15 border-t-terra",
        link: "font-semibold text-ink underline underline-offset-4",
      };
}

/**
 * Shell for in-page windows (booking, map): native modal <dialog> for focus trapping and
 * Escape, full-screen on phones, centred panel on larger screens, click-outside to close.
 */
export const InPageDialog = forwardRef<
  HTMLDialogElement,
  { label: string; title: string; variant: Variant; onClose: () => void; onRequestClose: () => void; footer?: ReactNode; children: ReactNode }
>(function InPageDialog({ label, title, variant, onClose, onRequestClose, footer, children }, ref) {
  const s = dialogSkin(variant);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onRequestClose()}
      className={`m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm sm:m-auto sm:h-[min(860px,92dvh)] sm:w-[min(820px,94vw)] ${s.panel}`}
    >
      <div className="flex h-full flex-col">
        <div className={`flex min-h-16 shrink-0 items-center gap-4 px-4 sm:px-6 ${s.bar}`}>
          <p className={`m-0 min-w-0 flex-1 truncate ${s.title}`}>{title}</p>
          <button type="button" onClick={onRequestClose} className={`grid h-10 w-10 shrink-0 place-items-center ${s.close}`} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className={`relative min-h-0 flex-1 overflow-y-auto ${s.body}`}>{children}</div>
        {footer && <div className={`shrink-0 px-4 py-3 text-[13px] sm:px-6 ${s.foot}`}>{footer}</div>}
      </div>
    </dialog>
  );
});

/** Opens a dialog when any link carrying `attr` is clicked (plain left-click only). */
export function delegateClicks(attr: string, onOpen: (link: HTMLAnchorElement) => void) {
  const handler = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest<HTMLAnchorElement>(`a[${attr}]`);
    if (!link) return;
    e.preventDefault();
    onOpen(link);
  };
  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}
