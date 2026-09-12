export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <div className="footer-logo-text">
            Trust<span className="accent">Cart</span>
          </div>
          <div className="footer-tagline">
            Next-Generation Cryptographically Verified E-Commerce.
          </div>
        </div>

        <div className="footer-tech-row">
          <span className="tech-tag">Spring Boot 4</span>
          <span className="tech-tag">Java 25</span>
          <span className="tech-tag">PostgreSQL</span>
          <span className="tech-tag">SHA-256</span>
          <span className="tech-tag">JWT JJWT</span>
          <span className="tech-tag">React 19</span>
          <span className="tech-tag">Vite 8</span>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© 2026 TrustCart Core Protocol. All rights reserved.</div>
        <div>Secure End-to-End Encryption Enabled</div>
      </div>
    </footer>
  );
}
