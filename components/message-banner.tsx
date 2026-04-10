export function MessageBanner({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <div className="message-banner container">{message}</div>;
}
