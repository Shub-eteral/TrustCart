export default function Features() {
  return (
    <section className="features-strip">
      <div className="features-grid">
        <div className="feature-item">
          <div className="feature-icon">🛡️</div>
          <div className="feature-text">
            <h4>SHA-256 Ledger</h4>
            <p>Every transaction is locked in cryptographic proof.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">⚡</div>
          <div className="feature-text">
            <h4>Instant Verification</h4>
            <p>Audit order and product authenticity with one click.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <div className="feature-text">
            <h4>Zero Counterfeiting</h4>
            <p>Each SKU carries an immutable cryptographic fingerprint.</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon">📦</div>
          <div className="feature-text">
            <h4>Transparent Origin</h4>
            <p>End-to-end chain of custody from warehouse to porch.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
