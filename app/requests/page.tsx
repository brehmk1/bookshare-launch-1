import { MessageBanner } from "@/components/message-banner";
import { RequestResponseForm } from "@/components/request-response-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { getRequestsForUser } from "@/lib/queries";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const user = await requireUser();
  const requests = await getRequestsForUser(user.id);

  return (
    <main className="section">
      <MessageBanner message={searchParams?.message} />
      <div className="container page-head">
        <div>
          <p className="section-kicker">Requests</p>
          <h1>Approve or deny access requests.</h1>
          <p>Incoming requests belong to your works. Outgoing requests show where you’re waiting on other authors.</p>
        </div>
      </div>

      <section className="container dashboard-grid">
        <div className="surface-card">
          <h2>Incoming requests</h2>
          {requests.incoming.length ? (
            <div className="stack-list">
              {requests.incoming.map((request) => (
                <div key={request.id} className="subtle-card">
                  <div className="listing-card-top">
                    <strong>{request.work?.title ?? "Unknown work"}</strong>
                    <span className={`pill ${request.status === "approved" ? "pill-accent" : ""}`}>{request.status}</span>
                  </div>
                  <p>Reader: {request.counterparty_name ?? "BookShare reader"}</p>
                  <p>Requested on {formatDate(request.created_at)}</p>
                  <p>{request.message || "No request message."}</p>
                  {request.status === "pending" ? (
                    <div className="request-response-grid">
                      <RequestResponseForm requestId={request.id} status="approved" />
                      <RequestResponseForm requestId={request.id} status="denied" />
                    </div>
                  ) : (
                    <p>Response: {request.response_message || "No response message."}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No incoming requests yet.</p>
          )}
        </div>

        <div className="surface-card">
          <h2>Outgoing requests</h2>
          {requests.outgoing.length ? (
            <div className="stack-list">
              {requests.outgoing.map((request) => (
                <div key={request.id} className="subtle-card">
                  <div className="listing-card-top">
                    <strong>{request.work?.title ?? "Unknown work"}</strong>
                    <span className={`pill ${request.status === "approved" ? "pill-accent" : ""}`}>{request.status}</span>
                  </div>
                  <p>Author: {request.counterparty_name ?? "BookShare author"}</p>
                  <p>Requested on {formatDate(request.created_at)}</p>
                  <p>{request.message || "No request message."}</p>
                  <p>Author response: {request.response_message || "No response yet."}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No outgoing requests yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
