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
          <h1>Transaction ledger</h1>
        <p>
            Review completed orders, their timestamps, and the transaction hashes
            returned by TrustCart verification.
        </p>
      </div>

      {loading ? (
        <div className="state-box">
          <div className="spinner" />
          <h3>Retrieving Ledger Transactions...</h3>
        </div>
      ) : orders.length === 0 ? (
        <div className="page-center">
            <div className="big-icon" aria-hidden="true">NO RECORDS</div>
            <h2>No orders recorded yet</h2>
          <p>
            Once you complete a purchase, its transaction hash and verification result
            will appear here.
          </p>
          <button className="btn-primary" onClick={onNavigateHome}>
              Start shopping
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
                    <div className="hash-label">TRANSACTION HASH</div>
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
                      Copy hash
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
