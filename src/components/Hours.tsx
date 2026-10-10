import type { Location } from "@/content/locations";

export function Hours({ hours, className = "" }: { hours: Location["hours"]; className?: string }) {
  return (
    <dl className={`border-t border-ink/[.07] pt-3 text-[13.5px] ${className}`}>
      {hours.map((h) => (
        <div key={h.days} className="flex justify-between gap-3 py-[2px]">
          <dt className="text-faint">{h.days}</dt>
          <dd className={`m-0 whitespace-nowrap ${h.closed ? "text-faint" : "text-soft"}`}>{h.time}</dd>
        </div>
      ))}
    </dl>
  );
}
