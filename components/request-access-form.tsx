import { createRequestAction } from "@/lib/actions/requests";

export function RequestAccessForm({ workId }: { workId: string }) {
  return (
    <form action={createRequestAction} className="surface-form compact-form">
      <input type="hidden" name="work_id" value={workId} />
      <div>
        <label htmlFor="message">Message to the author</label>
        <textarea id="message" name="message" placeholder="Share why you'd like access to this work." />
      </div>
      <button type="submit" className="primary-button">
        Request access
      </button>
    </form>
  );
}
