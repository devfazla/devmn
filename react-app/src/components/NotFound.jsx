export default function NotFound({ onGoHome }) {
  return (
    <section className="not-found-section visible" aria-labelledby="notfound-title">
      <div className="container not-found-card">
        <h1 id="notfound-title">
          404<span className="sr-only"> - Page Not Found</span>
        </h1>
        <p>Sorry, that page does not exist. Use the button below to return home.</p>
        <button type="button" className="btn btn-primary" onClick={onGoHome}>
          <i className="fas fa-home" aria-hidden="true"></i>
          Go Home
        </button>
      </div>
    </section>
  );
}
