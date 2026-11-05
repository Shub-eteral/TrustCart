import { useState } from "react";
import "./OrdersPage.css";

const API_URL = `http://${window.location.hostname}:8080`;
const formatPrice = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

export default function OrdersPage({
  orders = [],
  loading = false,
  userEmail = "",
  token = "",
  onNavigateHome,
  onRefreshOrders,
}) {
  const [verifying, setVerifying] = useState({});
  const [verificationResults, setVerificationResults] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [orderItems, setOrderItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [demoState, setDemoState] = useState({});

  const handleCopy = (orderId, hash) => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      setCopiedId(orderId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleVerify = async (orderId) => {
    setVerifying((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Verification failed");
      }

      const result = await res.json();
      setVerificationResults((prev) => ({ ...prev, [orderId]: result }));
    } catch (err) {
      setVerificationResults((prev) => ({
        ...prev,
        [orderId]: {
          valid: false,
          message: err.message || "Could not verify order",
        },
      }));
    } finally {
      setVerifying((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleToggleItems = async (orderId) => {
    if (expandedItems[orderId]) {
      setExpandedItems((prev) => ({ ...prev, [orderId]: false }));
      return;
    }

    setExpandedItems((prev) => ({ ...prev, [orderId]: true }));

    if (!orderItems[orderId]) {
      setLoadingItems((prev) => ({ ...prev, [orderId]: true }));
      try {
        const res = await fetch(`${API_URL}/api/orders/${orderId}/items`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const items = await res.json();
          setOrderItems((prev) => ({ ...prev, [orderId]: items }));
        }
      } catch (err) {
        console.error("Failed to load order items:", err);
      } finally {
        setLoadingItems((prev) => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const handleTamperTest = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/tamper-test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDemoState((prev) => ({
        ...prev,
        [orderId]: { tampered: true, message: data.message },
      }));
      // Automatically re-verify so user sees the immediate red tamper alert
      await handleVerify(orderId);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      alert("Tamper test error: " + err.message);
    }
  };

  const handleRestoreTest = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/restore-test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setDemoState((prev) => ({
        ...prev,
        [orderId]: { tampered: false, message: data.message },
      }));
      // Automatically re-verify so user sees the green authentic confirmation
      await handleVerify(orderId);
      if (onRefreshOrders) onRefreshOrders();
    } catch (err) {
      alert("Restore error: " + err.message);
    }
  };

  return (
    <main className="orders-page">
      <div className="orders-page-head">
        <div>
          <span className="eyebrow">TrustCart Ledger</span>
          <h1>Transaction History &amp; Blockchain Proof</h1>
          <p>
            Every order is permanently anchored to the TrustCart blockchain.
            Verify cryptographic proofs, check SHA-256 digests, and audit data
            integrity in real time.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {onRefreshOrders && (
            <button className="secondary-nav-btn" onClick={onRefreshOrders}>
              ↻ Refresh
            </button>
          )}
          <button className="secondary-nav-btn" onClick={onNavigateHome}>
            ← Back to Store
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: "80px 20px",
            textAlign: "center",
            color: "rgba(247,241,231,0.6)",
          }}
        >
          <h3>Retrieving Blockchain Ledger Transactions...</h3>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            padding: "70px 20px",
            textAlign: "center",
            background: "rgba(18,17,24,0.6)",
            borderRadius: "20px",
            border: "1px solid var(--line, rgba(247,241,231,0.15))",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📜</div>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            No Orders Recorded Yet
          </h2>
          <p
            style={{
              color: "rgba(247,241,231,0.6)",
              maxWidth: "400px",
              margin: "8px auto 24px",
            }}
          >
            Once you complete a purchase, its immutable block and cryptographic
            SHA-256 hash will appear here.
          </p>
          <button
            className="secondary-nav-btn"
            style={{
              background: "var(--coral, #ff795e)",
              color: "#0c0b10",
              border: "none",
            }}
            onClick={onNavigateHome}
          >
            Explore Catalog →
          </button>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((order) => {
            const isVerifying = verifying[order.id];
            const result = verificationResults[order.id];
            const isExpanded = expandedItems[order.id];
            const items = orderItems[order.id] || [];
            const isCopied = copiedId === order.id;
            const demo = demoState[order.id];

            return (
              <div className="order-card" key={order.id}>
                <div className="order-card-top">
                  <div className="order-id-group">
                    <span className="order-id-badge">Order #{order.id}</span>
                  </div>

                  <div className="order-tags-row">
                    <span
                      className={`badge-pill ${
                        order.status === "CONFIRMED"
                          ? "confirmed"
                          : order.status === "PLACED"
                          ? "placed"
                          : "cancelled"
                      }`}
                    >
                      {order.status || "CONFIRMED"}
                    </span>

                    <span className="badge-pill method">
                      {order.paymentMethod || "UPI"} •{" "}
                      {order.paymentStatus || "PAID"}
                    </span>
                  </div>
                </div>

                <div className="order-meta-grid">
                  <div className="meta-field">
                    <div className="k">Total Amount</div>
                    <div className="v amount">
                      {formatPrice(order.totalAmount)}
                    </div>
                  </div>

                  <div className="meta-field">
                    <div className="k">Date &amp; Time</div>
                    <div className="v" style={{ fontSize: "13px" }}>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString()
                        : "Just now"}
                    </div>
                  </div>

                  <div className="meta-field">
                    <div className="k">Account Custody</div>
                    <div className="v" style={{ fontSize: "13px" }}>
                      {userEmail}
                    </div>
                  </div>

                  <div className="meta-field">
                    <div className="k">Payment Reference</div>
                    <div
                      className="v"
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "rgba(247,241,231,0.7)",
                      }}
                    >
                      {order.paymentReference || "TC-PAY-" + order.id}
                    </div>
                  </div>
                </div>

                {/* Blockchain Hash Bar */}
                <div className="order-hash-bar">
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--lime, #d9f06b)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontWeight: "700",
                    }}
                  >
                    SHA-256:
                  </span>
                  <div
                    className="hash-preview-text"
                    title={order.blockchainHash}
                  >
                    {order.blockchainHash || "Pending..."}
                  </div>

                  <div className="hash-actions">
                    <button
                      className="ledger-btn copy"
                      onClick={() => handleCopy(order.id, order.blockchainHash)}
                    >
                      {isCopied ? "Copied! ✓" : "Copy"}
                    </button>

                    <button
                      className="ledger-btn verify"
                      disabled={isVerifying}
                      onClick={() => handleVerify(order.id)}
                    >
                      {isVerifying ? "Verifying..." : "⚡ Verify on Chain"}
                    </button>

                    <button
                      className="ledger-btn tamper"
                      onClick={() => handleTamperTest(order.id)}
                      title="College Viva Demonstration: Tamper order data in DB"
                    >
                      Simulate Tamper
                    </button>

                    <button
                      className="ledger-btn restore"
                      onClick={() => handleRestoreTest(order.id)}
                      title="College Viva Demonstration: Restore authentic order"
                    >
                      Restore
                    </button>
                  </div>
                </div>

                {/* Verification Result Banner */}
                {result && (
                  <div
                    className={`inline-verify-box ${
                      result.valid ? "valid" : "tampered"
                    }`}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "700",
                      }}
                    >
                      <span>{result.valid ? "🛡️" : "⚠️"}</span>
                      <span>
                        {result.valid
                          ? "Order Verified – Blockchain data is valid"
                          : "Tampering Detected – Hash mismatch or invalid blockchain"}
                      </span>
                    </div>
                    <div style={{ marginTop: "4px", fontSize: "12px" }}>
                      {result.message}
                    </div>

                    <div className="inline-details-mini">
                      <div>
                        Block Index:{" "}
                        {result.blockIndex !== undefined &&
                        result.blockIndex !== null
                          ? `#${result.blockIndex}`
                          : "N/A"}{" "}
                        | Chain Integrity:{" "}
                        <span
                          style={{
                            color: result.chainValid ? "#2ecc71" : "#ff7675",
                            fontWeight: "bold",
                          }}
                        >
                          {result.chainValid ? "VALID" : "COMPROMISED"}
                        </span>
                      </div>
                      <div>Recalculated SHA-256: {result.calculatedHash}</div>
                    </div>
                  </div>
                )}

                {/* View Items Toggle */}
                <div style={{ marginTop: "14px" }}>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--coral, #ff795e)",
                      fontSize: "12px",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    onClick={() => handleToggleItems(order.id)}
                  >
                    {isExpanded
                      ? "▲ Hide Purchased Items"
                      : "▼ View Purchased Items"}
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px 16px",
                        background: "rgba(12,11,16,0.6)",
                        borderRadius: "10px",
                        border: "1px solid var(--line, rgba(247,241,231,0.1))",
                      }}
                    >
                      {loadingItems[order.id] ? (
                        <span style={{ fontSize: "12px" }}>
                          Loading items...
                        </span>
                      ) : items.length === 0 ? (
                        <span style={{ fontSize: "12px", color: "gray" }}>
                          No item records found
                        </span>
                      ) : (
                        items.map((it) => (
                          <div
                            key={it.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "6px 0",
                              fontSize: "13px",
                              borderBottom:
                                "1px solid var(--line, rgba(247,241,231,0.06))",
                            }}
                          >
                            <span>
                              {it.product?.name || "Product"} × {it.quantity}
                            </span>
                            <strong>
                              {formatPrice(
                                (it.price || it.product?.price || 0) *
                                  it.quantity
                              )}
                            </strong>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
