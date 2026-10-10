import { site } from "@/content/site";
import { BookButton } from "./BookButton";

export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-[10px] border-t border-ink/15 bg-surface/95 px-[14px] py-[10px] backdrop-blur lg:hidden">
      <a
        href={site.corporate.phoneHref}
        className="inline-flex min-h-[40px] flex-1 items-center justify-center rounded-sm border border-ink/15 px-4 text-[13.5px] font-semibold"
      >
        Call
      </a>
      <BookButton className="!min-h-[40px] flex-1 !px-4 !py-[9px] !text-[13.5px]">Book now</BookButton>
    </div>
  );
}
