export default function Features() {
  return (
    <section className="features-strip">
      <div className="features-grid">
        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">01</div>
          <div className="feature-text">
            <h4>Product identity</h4>
            <p>Catalog records expose the product hash supplied by the platform.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">02</div>
          <div className="feature-text">
            <h4>Order verification</h4>
            <p>Run the available blockchain verification check against an order.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">03</div>
          <div className="feature-text">
            <h4>Account custody</h4>
            <p>Authenticated customers can review their own order history.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon" aria-hidden="true">04</div>
          <div className="feature-text">
            <h4>Structured records</h4>
            <p>Amounts, timestamps, statuses, and hashes stay together in one view.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
