import { site } from "@/content/site";

type Props = { children?: React.ReactNode; variant?: "primary" | "ghost" | "light"; className?: string; href?: string };

const base =
  "inline-flex min-h-[50px] items-center justify-center rounded-sm border px-7 py-[15px] text-[15px] font-semibold transition-colors";
const variants = {
  primary: "border-green bg-green text-green-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "border-ink/15 bg-transparent text-ink hover:border-ink",
  light: "border-white/40 bg-transparent text-green-ink hover:border-green-ink hover:bg-green-ink hover:text-green",
};

/** Every booking control on the site funnels through here, so the destination
 *  can never drift between pages. */
export function BookButton({ children, variant = "primary", className = "", href = site.booking.url }: Props) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${variants[variant]} ${className}`}>
      {children ?? site.booking.label}
    </a>
  );
}

export function LinkButton({ children, href, variant = "ghost", className = "", external = false }: Props & { href: string; external?: boolean }) {
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a href={href} {...ext} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </a>
  );
}
