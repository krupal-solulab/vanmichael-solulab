"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { InPageDialog, delegateClicks, dialogSkin, type Variant } from "./InPageDialog";

const BOOKSY_ORIGIN = "https://booksy.com";
const FRAME_NAME = "booking-frame";

type WidgetEvents = {
  resize?: { height: number };
  close?: unknown;
  goToUrl?: { url: string };
  sendPost?: { action: string; data: Record<string, string> };
  ready?: unknown;
};

/**
 * Booking without leaving the site.
 *
 * Opens the platform's official widget in an in-page dialog. The iframe is sandboxed
 * WITHOUT allow-popups and WITHOUT allow-top-navigation, so nothing inside it can open a
 * new tab or replace this page. Hand-offs the widget asks for (goToUrl, sendPost) are
 * loaded inside the same frame instead of the top window.
 *
 * Trade-off, by design: Booksy's "Continue with Facebook/Apple" and "Powered by Booksy"
 * need a popup, so they do nothing here. Email sign-in and the whole booking flow work.
 *
 * Message handling mirrors Booksy's loader (booksy.com/widget/code.js), filtered by
 * origin and a per-open uniqueId.
 */
export function BookingDialog({
  embedUrl, platform, title, variant, phone,
}: { embedUrl: string; platform: string; title: string; variant: Variant; phone?: { display: string; href: string } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [uid, setUid] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const s = dialogSkin(variant);

  const open = useCallback(
    (from: HTMLElement | null) => {
      opener.current = from;
      const id = `booksy-${Math.random().toString(36).slice(2, 12)}`;
      setUid(id);
      setLoaded(false);
      setSlow(false);
      setHeight(null);
      setSrc(`${embedUrl}&uniqueId=${id}`);
      dialog.current?.showModal();
      document.documentElement.style.overflow = "hidden";
    },
    [embedUrl],
  );

  const close = useCallback(() => dialog.current?.close(), []);

  useEffect(() => delegateClicks("data-book-embed", open), [open]);

  // If the widget has not loaded after 15s, offer the phone instead of an external link.
  useEffect(() => {
    if (!src || loaded) return;
    const t = window.setTimeout(() => setSlow(true), 15_000);
    return () => window.clearTimeout(t);
  }, [src, loaded]);

  // Widget → page messages.
  useEffect(() => {
    if (!uid) return;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== BOOKSY_ORIGIN) return;
      const msg = e.data as { uniqueId?: string; events?: WidgetEvents } | null;
      if (!msg || msg.uniqueId !== uid || !msg.events) return;
      const ev = msg.events;
      if (ev.ready) setLoaded(true);
      if (ev.resize && Number.isFinite(ev.resize.height)) setHeight(ev.resize.height);
      if (ev.close) close();
      // Keep hand-offs inside the dialog instead of navigating the visitor away.
      if (ev.goToUrl?.url && /^https:\/\//.test(ev.goToUrl.url)) {
        setHeight(null);
        setSrc(ev.goToUrl.url);
      }
      if (ev.sendPost?.action && /^https:\/\//.test(ev.sendPost.action)) {
        setHeight(null);
        postIntoFrame(ev.sendPost.action, ev.sendPost.data ?? {});
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [uid, close]);

  // Page → widget: the widget positions its own overlays from container/viewport size.
  useEffect(() => {
    if (!src) return;
    const post = () => {
      const target = frame.current?.contentWindow;
      if (!target) return;
      target.postMessage(
        { uniqueId: uid, name: "scroll", data: { container: frame.current!.getBoundingClientRect(), window: { width: window.innerWidth, height: window.innerHeight } } },
        BOOKSY_ORIGIN,
      );
    };
    const scroller = frame.current?.parentElement;
    scroller?.addEventListener("scroll", post, { passive: true });
    window.addEventListener("resize", post);
    const t = window.setTimeout(post, 400);
    return () => {
      scroller?.removeEventListener("scroll", post);
      window.removeEventListener("resize", post);
      window.clearTimeout(t);
    };
  }, [src, uid, loaded]);

  const onClose = () => {
    document.documentElement.style.overflow = "";
    setSrc(null);
    opener.current?.focus();
  };

  return (
    <InPageDialog
      ref={dialog}
      label={`Book at ${title}`}
      title={`Book at ${title}`}
      variant={variant}
      onClose={onClose}
      onRequestClose={close}
      footer={
        <p className="m-0 text-center">
          Booking is handled securely by {platform}. Sign in with your email to confirm.
          {phone && <> Prefer to call? <a href={phone.href} className={s.link}>{phone.display}</a></>}
        </p>
      }
    >
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center p-8 text-center" role="status">
          {slow ? (
            <p className="max-w-[36ch]">
              Booking is taking longer than usual to load.{" "}
              {phone ? <>You can also book by phone at <a href={phone.href} className={s.link}>{phone.display}</a>.</> : "Please try again in a moment."}
            </p>
          ) : (
            <span className={`h-9 w-9 animate-spin rounded-full border-2 ${s.spinner}`}><span className="sr-only">Loading booking…</span></span>
          )}
        </div>
      )}
      {src && (
        <iframe
          ref={frame}
          name={FRAME_NAME}
          src={src}
          title={`${platform} booking for ${title}`}
          // No allow-popups / allow-top-navigation: the visitor cannot be taken off this site.
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
          allow="payment"
          onLoad={() => setLoaded(true)}
          className="block w-full border-0"
          style={{ height: height ? `${height}px` : "100%", minHeight: "100%" }}
        />
      )}
    </InPageDialog>
  );
}

/** Booksy's loader POSTs payment hand-offs to the top window; we target the dialog frame instead. */
function postIntoFrame(action: string, data: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "post";
  form.action = action;
  form.target = FRAME_NAME;
  for (const [name, value] of Object.entries(data)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
