import { ReactNode } from "react";
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-site px-5 sm:px-8 lg:px-16 ${className}`}>{children}</div>;
}
