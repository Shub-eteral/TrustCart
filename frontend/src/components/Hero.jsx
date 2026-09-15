export default function Hero({ token, onOpenAccount, setActiveTab, lastPlacedOrder }) {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-grid" />

      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            Authenticated commerce record
          </div>

          <h1>
            Shop with certainty.
            <br />
            <span className="gradient">Not just a cart.</span>
          </h1>

          <p className="hero-desc">
            Every product record and completed order is tied to a cryptographic
            identifier, so your commerce history can be inspected instead of
            simply trusted.
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
              Shop secure products
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
              {token ? "Open verification history" : "Sign in to verify orders"}
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">SHA-256</div>
              <div className="lbl">Product records</div>
            </div>
            <div className="hero-stat">
              <div className="num">Ledger</div>
              <div className="lbl">Order history</div>
            </div>
            <div className="hero-stat">
              <div className="num">Live</div>
              <div className="lbl">Order verification</div>
            </div>
          </div>
        </div>

        {/* HERO BLOCKCHAIN NODE VISUALIZER CARD */}
        <div className="hero-card">
          <div className="hc-header">
            <div className="hc-icon" aria-hidden="true">TC</div>
            <div>
              <div className="hc-title">Verification record</div>
              <div className="hc-sub">TrustCart transaction ledger</div>
            </div>
          </div>

          <div className="chain-block">
            <div className="cb-top">
              <span className="cb-num">Record / product index</span>
              <span className="cb-valid">Recorded</span>
            </div>
            <div className="cb-hash">
              Product hashes are shown on each catalog record
            </div>
            <div className="cb-data">Product identity precedes checkout</div>
          </div>

          <div className="chain-connector">▼ ▼ ▼</div>

          <div className="chain-block">
            <div className="cb-top">
              <span className="cb-num">Record / latest order</span>
              <span className="cb-valid">{lastPlacedOrder ? "Confirmed" : "Awaiting order"}</span>
            </div>
            <div className="cb-hash">
              {lastPlacedOrder?.blockchainHash
                ? `${lastPlacedOrder.blockchainHash.slice(0, 24)}...`
                : "Place an order to receive its transaction hash"}
            </div>
            <div className="cb-data">
              {lastPlacedOrder ? "ORDER_ID=" : "Status: "}{lastPlacedOrder?.id || "No order recorded"}{lastPlacedOrder ? " | TOTAL=₹" : ""}
              {lastPlacedOrder?.totalAmount
                ? Number(lastPlacedOrder.totalAmount).toLocaleString("en-IN")
                : ""}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
