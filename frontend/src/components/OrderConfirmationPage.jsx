import { useState } from "react";
import "./OrderConfirmationPage.css";

const API_URL = `http://${window.location.hostname}:8080`;
const formatPrice = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

export default function OrderConfirmationPage({
  order,
  token,
  onContinueShopping,
  onViewOrders,
}) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [tamperState, setTamperState] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  if (!order) {
    return (
      <div className="confirmation-page-container">
        <div className="confirmation-card" style={{ textAlign: "center" }}>
          <h2>No active order found</h2>
          <button className="secondary-nav-btn" onClick={onContinueShopping}>
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const orderId = order.orderId || order.id;
  const hash = order.blockchainHash || "Pending Hash generation...";
  const paymentMethod = order.paymentMethod || "UPI";
  const paymentStatus = order.paymentStatus || "SUCCESS";
  const paymentRef = order.paymentReferenceId || order.paymentReference || "N/A";
  const totalAmount = order.totalAmount || order.amount || 0;
  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleString()
    : new Date().toLocaleString();

  const handleCopyHash = () => {
    if (hash) {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error((await res.text()) || "Verification failed");
      }

      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      setVerificationResult({
        valid: false,
        message: err.message || "Failed to contact verification service.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperTest = async () => {
    setActionBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/tamper-test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTamperState({
        tampered: true,
        message: data.message,
        tamperedAmount: data.tamperedAmount,
      });
      // Automatically re-verify to show evaluators immediate tamper detection!
      await handleVerify();
    } catch (err) {
      alert("Tamper test error: " + err.message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleRestoreTest = async () => {
    setActionBusy(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/restore-test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setTamperState({
        tampered: false,
        message: data.message,
      });
      // Automatically re-verify to return to green verified status!
      await handleVerify();
    } catch (err) {
      alert("Restore test error: " + err.message);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="confirmation-page-container">
      <div className="confirmation-card">
        {/* Success Header */}
        <div className="success-hero">
          <div className="success-badge-icon">✓</div>
          <span className="eyebrow">TrustCart Cryptographic Ledger</span>
          <h1>Order Confirmed &amp; Anchored</h1>
          <p>
            Your transaction has been cryptographically sealed and permanently
            recorded on the TrustCart blockchain ledger.
          </p>
        </div>

        {/* Order Metadata Grid */}
        <div className="order-specs-grid">
          <div className="spec-cell">
            <div className="label">Order Reference</div>
            <div className="value">#{orderId}</div>
          </div>

          <div className="spec-cell">
            <div className="label">Payment Status</div>
            <div className="value">
              <span
                className={`status-chip ${
                  paymentMethod === "COD" ? "cod" : "success"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
          </div>

          <div className="spec-cell">
            <div className="label">Payment Method</div>
            <div className="value">{paymentMethod}</div>
          </div>

          <div className="spec-cell">
            <div className="label">Total Amount</div>
            <div className="value highlight">{formatPrice(totalAmount)}</div>
          </div>

          <div className="spec-cell">
            <div className="label">Timestamp</div>
            <div className="value" style={{ fontSize: "13px" }}>
              {orderDate}
            </div>
          </div>

          <div className="spec-cell">
            <div className="label">Gateway Reference</div>
            <div
              className="value"
              style={{
                fontSize: "12px",
                fontFamily: "monospace",
                color: "rgba(247,241,231,0.8)",
              }}
            >
              {paymentRef}
            </div>
          </div>
        </div>

        {/* Blockchain Transaction Hash Box */}
        <div className="blockchain-hash-panel">
          <div className="hash-panel-head">
            <span>SHA-256 Blockchain Transaction Hash</span>
            <button className="hash-copy-btn" onClick={handleCopyHash}>
              {copied ? "Copied! ✓" : "Copy Hash"}
            </button>
          </div>
          <div className="hash-string-display">{hash}</div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions-row">
          <button
            className="verify-blockchain-btn"
            disabled={verifying || actionBusy}
            onClick={handleVerify}
          >
            {verifying ? "Verifying On-Chain..." : "⚡ Verify Blockchain"}
          </button>

          <button className="secondary-nav-btn" onClick={onViewOrders}>
            View Order Ledger
          </button>

          <button className="secondary-nav-btn" onClick={onContinueShopping}>
            Continue Shopping →
          </button>
        </div>

        {/* Verification Result Banner (Green = Valid, Red = Tampered) */}
        {verificationResult && (
          <div
            className={`verification-result-box ${
              verificationResult.valid ? "valid" : "tampered"
            }`}
          >
            <div className="result-title-row">
              <span>{verificationResult.valid ? "🛡️" : "⚠️"}</span>
              <span>
                {verificationResult.valid
                  ? "Order Verified – Blockchain data is valid"
                  : "Tampering Detected – Hash mismatch or invalid blockchain"}
              </span>
            </div>

            <p className="result-explanation">{verificationResult.message}</p>

            <div className="verification-details-table">
              <div className="detail-line">
                <span className="k">Block Index:</span>
                <span>
                  {verificationResult.blockIndex !== undefined &&
                  verificationResult.blockIndex !== null
                    ? `#${verificationResult.blockIndex}`
                    : "N/A"}
                </span>
              </div>
              <div className="detail-line">
                <span className="k">Stored Hash:</span>
                <span>{verificationResult.blockchainHash || hash}</span>
              </div>
              <div className="detail-line">
                <span className="k">Recalculated Hash:</span>
                <span
                  style={{
                    color: verificationResult.valid ? "#2ecc71" : "#ff7675",
                  }}
                >
                  {verificationResult.calculatedHash || "Recalculated at runtime"}
                </span>
              </div>
              {verificationResult.previousHash && (
                <div className="detail-line">
                  <span className="k">Previous Block Hash:</span>
                  <span>{verificationResult.previousHash}</span>
                </div>
              )}
              <div className="detail-line">
                <span className="k">Chain Integrity Status:</span>
                <span
                  style={{
                    color: verificationResult.chainValid ? "#2ecc71" : "#ff7675",
                  }}
                >
                  {verificationResult.chainValid
                    ? "UNBROKEN & VERIFIED"
                    : "TAMPER DETECTED"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Presentation Demonstration Panel (Viva Tamper Testing) */}
        <div className="college-demo-panel">
          <div className="demo-box-head">
            <span className="demo-badge">Presentation Demonstration Control</span>
            <small style={{ color: "rgba(247, 241, 231, 0.6)" }}>
              Evaluator Viva Walkthrough
            </small>
          </div>

          <p className="demo-instruction">
            Demonstrate how blockchain immutability prevents unauthorized data
            tampering. Click <strong>Simulate Tampering</strong> to modify the
            database record. When you verify again, TrustCart will detect the SHA-256
            hash mismatch and flag the alteration. Click <strong>Restore</strong>{" "}
            to return the order to its authentic state.
          </p>

          <div className="demo-buttons-row">
            <button
              className="tamper-btn"
              disabled={actionBusy}
              onClick={handleTamperTest}
            >
              {actionBusy ? "Processing..." : "🚨 Simulate Tampering (Demo)"}
            </button>

            <button
              className="restore-btn"
              disabled={actionBusy}
              onClick={handleRestoreTest}
            >
              {actionBusy ? "Restoring..." : "🔄 Restore Original Order"}
            </button>
          </div>

          {tamperState && (
            <div
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: tamperState.tampered ? "#ff9999" : "#a8e6cf",
              }}
            >
              {tamperState.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
