export default function OrdersPage({
  orders,
  loading,
  userEmail,
  verifyingOrder,
  verificationResult,
  onVerifyOrder,
  onCopyToClipboard,
  onNavigateHome,
}) {
  return (
    <main className="orders-page">
      <div className="page-head">
        <h1>Cryptographic Order History</h1>
        <p>
          Inspect your purchase pedigree and run live consensus checks against
          the TrustCart blockchain.
        </p>
      </div>

      {loading ? (
        <div className="state-box">
          <div className="spinner" />
          <h3>Retrieving Ledger Transactions...</h3>
        </div>
      ) : orders.length === 0 ? (
        <div className="page-center">
          <div className="big-icon">📦</div>
          <h2>No Orders Recorded Yet</h2>
          <p>
            Once you complete a purchase, its block hash and cryptographic proof
            will appear here.
          </p>
          <button className="btn-primary" onClick={onNavigateHome}>
            Start Shopping →
          </button>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((order) => {
            const isVerifying = verifyingOrder[order.id];
            const res = verificationResult[order.id];

            return (
              <div className="order-card" key={order.id}>
                <div className="order-card-top">
                  <div className="order-id-text">
                    <span className="pre">TX #</span>
                    <span>{order.id}</span>
                  </div>
                  <div
                    className={`status-badge ${
                      order.status?.toLowerCase() === "placed"
                        ? "placed"
                        : "delivered"
                    }`}
                  >
                    {order.status || "CONFIRMED"}
                  </div>
                </div>

                <div className="order-meta-row">
                  <div className="order-meta-item">
                    <div className="lbl">Total Amount</div>
                    <div className="val amount">
                      ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="order-meta-item">
                    <div className="lbl">Timestamp</div>
                    <div className="val">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString()
                        : "Just now"}
                    </div>
                  </div>

                  <div className="order-meta-item">
                    <div className="lbl">Custody Account</div>
                    <div className="val">{userEmail}</div>
                  </div>
                </div>

                <div className="order-hash-row">
                  <div className="hash-label">
                    <span>⛓️</span> SHA-256 HASH:
                  </div>
                  <div className="hash-value" title={order.blockchainHash}>
                    {order.blockchainHash || "N/A"}
                  </div>

                  <button
                    className="verify-btn"
                    onClick={() =>
                      onCopyToClipboard(
                        order.blockchainHash,
                        "Blockchain Hash"
                      )
                    }
                  >
                    📋 Copy
                  </button>

                  <button
                    className="verify-btn"
                    disabled={isVerifying}
                    onClick={() => onVerifyOrder(order.id)}
                  >
                    {isVerifying ? "Verifying..." : "⚡ Verify on Chain"}
                  </button>
                </div>

                {res && (
                  <div
                    className={`verify-result ${res.isValid ? "ok" : "fail"}`}
                  >
                    <span>{res.isValid ? "🛡️" : "⚠️"}</span>
                    <span>
                      {res.message} (Checked at {res.timestamp})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
