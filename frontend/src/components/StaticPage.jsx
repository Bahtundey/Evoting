// Shared layout for simple informational pages (About, Contact, FAQ, etc.).
export default function StaticPage({ title, subtitle, children }) {
  return (
    <div className="page">
      <div className="container container-narrow">
        <div className="page-header">
          <div>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-body static-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
