import { respondToRequestAction } from "@/lib/actions/requests";

interface RequestResponseFormProps {
  requestId: string;
  status: "approved" | "denied";
}

export function RequestResponseForm({ requestId, status }: RequestResponseFormProps) {
  return (
    <form action={respondToRequestAction} className="inline-form">
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="status" value={status} />
      <textarea
        name="response_message"
        placeholder={status === "approved" ? "Optional approval note" : "Optional denial note"}
        rows={3}
      />
      <button type="submit" className={status === "approved" ? "primary-button" : "secondary-button"}>
        {status === "approved" ? "Approve request" : "Deny request"}
      </button>
    </form>
  );
}
