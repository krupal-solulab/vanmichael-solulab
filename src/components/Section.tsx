import { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  children, id, className = "", tone = "paper",
}: { children: ReactNode; id?: string; className?: string; tone?: "paper" | "sunk" | "green" }) {
  const tones = { paper: "bg-paper", sunk: "bg-sunk", green: "bg-green text-green-ink" };
  return (
    <section id={id} className={`${tones[tone]} py-14 sm:py-20 lg:py-24 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`mb-[14px] text-[12.5px] font-semibold uppercase tracking-[.09em] ${light ? "text-[#9FC9BA]" : "text-green"}`}>
      {children}
    </p>
  );
}
