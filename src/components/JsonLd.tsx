export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Data is authored in this repo, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
