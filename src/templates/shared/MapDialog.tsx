"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { InPageDialog, delegateClicks, dialogSkin, type Variant } from "./InPageDialog";

/**
 * Directions without leaving the site: links carrying `data-map-embed` open Google's
 * embeddable map of the business in an in-page dialog. (maps.google.com itself refuses to
 * be framed; the /maps?output=embed form is Google's supported embed.)
 * The map frame is sandboxed without popups so its own "View larger map" cannot open a tab.
 */
export function MapDialog({
  embedUrl, title, address, variant, phone,
}: { embedUrl: string; title: string; address: string; variant: Variant; phone?: { display: string; href: string } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const s = dialogSkin(variant);

  const show = useCallback((from: HTMLElement) => {
    opener.current = from;
    setOpen(true);
    dialog.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  }, []);

  useEffect(() => delegateClicks("data-map-embed", show), [show]);

  return (
    <InPageDialog
      ref={dialog}
      label={`Map and directions to ${title}`}
      title={title}
      variant={variant}
      onClose={() => {
        document.documentElement.style.overflow = "";
        setOpen(false);
        opener.current?.focus();
      }}
      onRequestClose={() => dialog.current?.close()}
      footer={
        <p className="m-0">
          <span className="font-semibold">{address}</span>
          {phone && <> · <a href={phone.href} className={s.link}>{phone.display}</a></>}
        </p>
      }
    >
      {open && <MapFrame src={embedUrl} title={`Map of ${title}`} className="block h-full min-h-[360px] w-full border-0" />}
    </InPageDialog>
  );
}

export function MapFrame({ src, title, className = "" }: { src: string; title: string; className?: string }) {
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      sandbox="allow-scripts allow-same-origin"
      className={className}
    />
  );
}
