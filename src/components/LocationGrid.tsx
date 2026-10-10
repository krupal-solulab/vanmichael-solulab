"use client";
import { useState } from "react";
import { locations, areaLabels, type Area } from "@/content/locations";
import { LocationCard } from "./LocationCard";

const filters: (Area | "all")[] = ["all", "intown", "north", "men", "aesthetics"];

export function LocationGrid() {
  const [area, setArea] = useState<Area | "all">("all");
  const shown = area === "all" ? locations : locations.filter((l) => l.area === area);

  return (
    <>
      <div className="my-7 flex flex-wrap gap-2" role="group" aria-label="Filter locations">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setArea(f)}
            aria-pressed={area === f}
            className={`min-h-[38px] rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors ${
              area === f ? "border-green bg-green text-green-ink" : "border-ink/15 text-ink hover:border-ink"
            }`}
          >
            {areaLabels[f]}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {shown.map((l) => <LocationCard key={l.slug} loc={l} />)}
      </div>
    </>
  );
}
