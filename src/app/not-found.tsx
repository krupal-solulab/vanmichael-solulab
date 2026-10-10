import { Section } from "@/components/Section";
import { LinkButton } from "@/components/BookButton";

export default function NotFound() {
  return (
    <Section>
      <h1 className="h2">That page has moved.</h1>
      <p className="lede mt-3">Try our locations, or book straight away.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <LinkButton href="/locations/" variant="primary">Find a salon</LinkButton>
        <LinkButton href="/">Home</LinkButton>
      </div>
    </Section>
  );
}
