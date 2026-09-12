export default function Hero({ token, onOpenAccount, setActiveTab, lastPlacedOrder }) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />

      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            Decentralized Trust Protocol
          </div>

          <h1>
            Cryptographically <br />
            <span className="gradient">Verified Commerce</span>
          </h1>

          <p className="hero-desc">
            Every order on TrustCart is etched into an immutable SHA-256
            blockchain ledger. Verify product authenticity, track purchase
            pedigree, and experience commerce without counterfeits.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => {
                document
                  .querySelector(".products-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              ⚡ Browse Products →
            </button>

            <button
              className="btn-ghost"
              onClick={() => {
                if (!token) {
                  onOpenAccount();
                } else {
                  setActiveTab("orders");
                }
              }}
            >
              ⛓️ Verify Order Hash
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">256-bit</div>
              <div className="lbl">Cryptographic Hash</div>
            </div>
            <div className="hero-stat">
              <div className="num">100%</div>
              <div className="lbl">Tamper Proof</div>
            </div>
            <div className="hero-stat">
              <div className="num">Instant</div>
              <div className="lbl">Consensus Verification</div>
            </div>
          </div>
        </div>

        {/* HERO BLOCKCHAIN NODE VISUALIZER CARD */}
        <div className="hero-card">
          <div className="hc-header">
            <div className="hc-icon">⛓️</div>
            <div>
              <div className="hc-title">Live Chain State</div>
              <div className="hc-sub">Active Consensus Node #1</div>
            </div>
          </div>

          <div className="chain-block">
            <div className="cb-top">
              <span className="cb-num">Block #0 (Genesis)</span>
              <span className="cb-valid">✓ Intact</span>
            </div>
            <div className="cb-hash">
              0000a3f892c9431e5f8842...a98e
            </div>
            <div className="cb-data">Data: Genesis Block Protocol</div>
          </div>

          <div className="chain-connector">▼ ▼ ▼</div>

          <div className="chain-block">
            <div className="cb-top">
              <span className="cb-num">Block #1 (Current Head)</span>
              <span className="cb-valid">✓ Verified</span>
            </div>
            <div className="cb-hash">
              {lastPlacedOrder?.blockchainHash
                ? `${lastPlacedOrder.blockchainHash.slice(0, 24)}...`
                : "8b7e21a0fd19c088de47b2...ec41"}
            </div>
            <div className="cb-data">
              Data: ORDER_ID={lastPlacedOrder?.id || "42"}|TOTAL=₹
              {lastPlacedOrder?.totalAmount
                ? Number(lastPlacedOrder.totalAmount).toLocaleString("en-IN")
                : "4,999"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
