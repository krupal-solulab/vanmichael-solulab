"use client";
import { useActionState } from "react";
import { saveFacts, type FormState } from "../../../actions";

export function EditForm({ id, initial }: { id: string; initial: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveFacts.bind(null, id), undefined);
  return (
    <form action={action} className="mt-5 space-y-3">
      <label htmlFor="record" className="sr-only">Business record JSON</label>
      <textarea id="record" name="record" defaultValue={initial} spellCheck={false} className="h-[70vh] w-full rounded-xl border border-tool-line bg-white p-4 font-mono text-[12.5px] leading-5" />
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      <button disabled={pending} className="inline-flex min-h-11 items-center rounded-lg bg-tool-accent px-5 font-semibold text-white disabled:opacity-60">
        {pending ? "Saving…" : "Validate and save"}
      </button>
    </form>
  );
}
