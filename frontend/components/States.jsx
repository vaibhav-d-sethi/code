import Icon from "./Icon";

export function Skeleton({ height = 20, width = "100%" }) {
  return <div className="skeleton" style={{ height, width }} aria-hidden="true" />;
}

export function ErrorCard({ message, onRetry, retryLabel = "Try again", link }) {
  return (
    <div className="card error" role="alert">
      <div style={{ color: "var(--bad)", marginBottom: 8 }}><Icon name="alert" size={30} /></div>
      <h3>Something did not work</h3>
      <p style={{ maxWidth: "52ch", margin: "0 auto 16px" }}>{message}</p>
      <div className="row" style={{ justifyContent: "center" }}>
        {onRetry && <button className="btn" onClick={onRetry}>{retryLabel}</button>}
        {link && <a className="btn ghost" href={link.href}>{link.label}</a>}
      </div>
    </div>
  );
}

export function EmptyCard({ title, children }) {
  return (
    <div className="card empty">
      <h3>{title}</h3>
      <p style={{ maxWidth: "50ch", margin: "0 auto" }}>{children}</p>
    </div>
  );
}
