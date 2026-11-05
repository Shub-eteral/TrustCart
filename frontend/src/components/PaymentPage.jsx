import { useState, useEffect } from "react";
import "./PaymentPage.css";

const API_URL = `http://${window.location.hostname}:8080`;

const formatPrice = (val) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

export default function PaymentPage({
  cart = [],
  token,
  userEmail,
  onBack,
  onPaymentSuccess,
}) {
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("student@okhdfcbank");
  const [cardData, setCardData] = useState({
    name: "Alex Vance",
    number: "4532 8921 7762 1094",
    expiry: "12/28",
    cvv: "882",
  });
  const [simulatedSuccess, setSimulatedSuccess] = useState(true);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [error, setError] = useState("");
  const [paymentRequest, setPaymentRequest] = useState(null);

  // Compute subtotal from cart
  const subtotal = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const deliveryCharge = 0; // Free luxury delivery
  const totalAmount = subtotal + deliveryCharge;

  // Initialize payment request on backend when mounting or changing method
  useEffect(() => {
    if (!token || !cart.length) return;

    const initPayment = async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentMethod,
            upiId: paymentMethod === "UPI" ? upiId : undefined,
            cardLast4:
              paymentMethod === "CARD"
                ? cardData.number.replace(/\s+/g, "").slice(-4)
                : undefined,
            cardHolderName: paymentMethod === "CARD" ? cardData.name : undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setPaymentRequest(data);
        }
      } catch (err) {
        console.warn("Could not pre-initiate payment:", err);
      }
    };

    initPayment();
  }, [paymentMethod, token]);

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardData({ ...cardData, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setCardData({ ...cardData, expiry: val });
  };

  const validateForm = () => {
    if (paymentMethod === "UPI") {
      if (!upiId || !upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g., yourname@upi)");
        return false;
      }
    } else if (paymentMethod === "CARD") {
      const cleanNum = cardData.number.replace(/\s+/g, "");
      if (cleanNum.length < 15) {
        setError("Please enter a valid 16-digit card number");
        return false;
      }
      if (!cardData.name.trim()) {
        setError("Cardholder name is required");
        return false;
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        setError("Valid expiry date required (MM/YY)");
        return false;
      }
      if (!cardData.cvv || cardData.cvv.length < 3) {
        setError("Valid 3-digit CVV required");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Step 1: Initialize payment on backend if not already done
      let activeReq = paymentRequest;
      if (!activeReq) {
        setProcessingStep("Initiating secure transaction...");
        const initRes = await fetch(`${API_URL}/api/payments/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentMethod,
            upiId: paymentMethod === "UPI" ? upiId : undefined,
            cardLast4:
              paymentMethod === "CARD"
                ? cardData.number.replace(/\s+/g, "").slice(-4)
                : undefined,
          }),
        });

        if (!initRes.ok) {
          throw new Error((await initRes.text()) || "Failed to initiate payment");
        }
        activeReq = await initRes.json();
        setPaymentRequest(activeReq);
      }

      // Step 2: Simulated bank network connection animation
      setProcessingStep("Connecting to payment processing network...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep(
        paymentMethod === "COD"
          ? "Authorizing Cash on Delivery booking..."
          : simulatedSuccess
          ? "Verifying transaction credentials..."
          : "Checking card & banking limits..."
      );
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Call backend confirmation endpoint
      setProcessingStep("Recording on TrustCart Blockchain & finalizing...");
      const confirmRes = await fetch(`${API_URL}/api/payments/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: activeReq.paymentId,
          paymentReferenceId: activeReq.paymentReferenceId,
          paymentMethod,
          simulatedSuccess: paymentMethod === "COD" ? true : simulatedSuccess,
          transactionNote:
            paymentMethod === "UPI"
              ? `UPI ID: ${upiId}`
              : paymentMethod === "CARD"
              ? `Card ending in ${cardData.number.replace(/\s+/g, "").slice(-4)}`
              : "Cash on delivery",
        }),
      });

      const result = await confirmRes.json();

      if (!confirmRes.ok || result.paymentStatus === "FAILED") {
        throw new Error(
          result.failureReason ||
            result.message ||
            "Payment failed. Card or bank transaction was declined."
        );
      }

      // Success! Hand over confirmed order to confirmation page
      onPaymentSuccess(result);
    } catch (err) {
      setError(err.message || "An error occurred while processing payment.");
    } finally {
      setLoading(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="payment-page-container">
      {/* Header */}
      <div className="payment-header">
        <div>
          <span className="eyebrow">TrustCart Secure Gateway</span>
          <h1
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "32px",
              margin: "6px 0 0",
              letterSpacing: "-0.03em",
            }}
          >
            Checkout &amp; Payment
          </h1>
        </div>
        <button className="payment-back-btn" onClick={onBack}>
          ← Return to selection
        </button>
      </div>

      <div className="payment-grid">
        {/* Left column: Payment Methods */}
        <div className="payment-methods-card">
          <div className="section-title-wrap">
            <span className="eyebrow">Step 1 of 2</span>
            <h2>Select Payment Method</h2>
          </div>

          <div className="method-tabs" role="tablist">
            <button
              type="button"
              className={`method-tab ${paymentMethod === "UPI" ? "active" : ""}`}
              onClick={() => {
                setPaymentMethod("UPI");
                setError("");
              }}
            >
              <span className="icon">📱</span>
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              className={`method-tab ${paymentMethod === "CARD" ? "active" : ""}`}
              onClick={() => {
                setPaymentMethod("CARD");
                setError("");
              }}
            >
              <span className="icon">💳</span>
              <span>Card</span>
            </button>

            <button
              type="button"
              className={`method-tab ${paymentMethod === "COD" ? "active" : ""}`}
              onClick={() => {
                setPaymentMethod("COD");
                setError("");
              }}
            >
              <span className="icon">💵</span>
              <span>Cash on Delivery</span>
            </button>

            <button
              type="button"
              className={`method-tab ${paymentMethod === "ONLINE" ? "active" : ""}`}
              onClick={() => {
                setPaymentMethod("ONLINE");
                setError("");
              }}
            >
              <span className="icon">⚡</span>
              <span>Gateway (Test)</span>
            </button>
          </div>

          <form onSubmit={handleProcessPayment}>
            {/* UPI Section */}
            {paymentMethod === "UPI" && (
              <div className="method-form-body">
                <div className="payment-form-group">
                  <label>Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    className="payment-input"
                    placeholder="username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                  <div className="quick-pills">
                    {["@okhdfcbank", "@okaxis", "@paytm", "@ybl"].map((suffix) => (
                      <button
                        type="button"
                        key={suffix}
                        className="quick-pill"
                        onClick={() =>
                          setUpiId((prev) => {
                            const prefix = prev.split("@")[0] || "user";
                            return prefix + suffix;
                          })
                        }
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="qr-preview-box">
                  <div className="mock-qr-visual" aria-hidden="true">
                    {/* SVG Mock QR Code */}
                    <svg viewBox="0 0 100 100" fill="#0c0b10">
                      <rect x="0" y="0" width="30" height="30" rx="4" />
                      <rect x="5" y="5" width="20" height="20" fill="white" />
                      <rect x="10" y="10" width="10" height="10" />
                      <rect x="70" y="0" width="30" height="30" rx="4" />
                      <rect x="75" y="5" width="20" height="20" fill="white" />
                      <rect x="80" y="10" width="10" height="10" />
                      <rect x="0" y="70" width="30" height="30" rx="4" />
                      <rect x="5" y="75" width="20" height="20" fill="white" />
                      <rect x="10" y="80" width="10" height="10" />
                      <rect x="40" y="10" width="10" height="20" />
                      <rect x="55" y="15" width="10" height="15" />
                      <rect x="40" y="40" width="20" height="20" rx="2" />
                      <rect x="65" y="45" width="15" height="10" />
                      <rect x="15" y="40" width="15" height="15" />
                      <rect x="75" y="75" width="20" height="20" />
                      <rect x="40" y="70" width="10" height="20" />
                    </svg>
                  </div>
                  <div className="qr-info">
                    <p>
                      Scan QR code with any UPI app (Google Pay, PhonePe, Paytm,
                      BHIM).
                    </p>
                    <strong>UPI ID: trustcart@icici</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Card Section */}
            {paymentMethod === "CARD" && (
              <div className="method-form-body">
                <div className="payment-form-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    className="payment-input"
                    placeholder="Name as on card"
                    value={cardData.name}
                    onChange={(e) =>
                      setCardData({ ...cardData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="payment-form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    className="payment-input"
                    placeholder="4532 •••• •••• 1094"
                    value={cardData.number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="card-row-two">
                  <div className="payment-form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      className="payment-input"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className="payment-form-group">
                    <label>CVV / CVC</label>
                    <input
                      type="password"
                      className="payment-input"
                      placeholder="•••"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash on Delivery Section */}
            {paymentMethod === "COD" && (
              <div className="method-form-body">
                <div
                  style={{
                    padding: "20px",
                    background: "rgba(217, 240, 107, 0.05)",
                    border: "1px solid rgba(217, 240, 107, 0.2)",
                    borderRadius: "14px",
                    lineHeight: "1.6",
                    fontSize: "13px",
                  }}
                >
                  <p style={{ margin: "0 0 10px", fontWeight: "600" }}>
                    💵 Pay in Cash or UPI upon Doorstep Delivery
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "rgba(247, 241, 231, 0.7)",
                      fontSize: "12px",
                    }}
                  >
                    Your order will be instantly verified and anchored to the
                    TrustCart Blockchain. A delivery agent will collect{" "}
                    <strong>{formatPrice(totalAmount)}</strong> at the time of
                    handover.
                  </p>
                </div>
              </div>
            )}

            {/* Online Test Gateway Section */}
            {paymentMethod === "ONLINE" && (
              <div className="method-form-body">
                <div
                  style={{
                    padding: "20px",
                    background: "rgba(255, 121, 94, 0.06)",
                    border: "1px solid rgba(255, 121, 94, 0.25)",
                    borderRadius: "14px",
                    lineHeight: "1.6",
                    fontSize: "13px",
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontWeight: "600" }}>
                    ⚡ Razorpay / TrustCart Test Gateway Integration
                  </p>
                  <p
                    style={{
                      margin: "0 0 10px",
                      color: "rgba(247, 241, 231, 0.7)",
                      fontSize: "12px",
                    }}
                  >
                    Simulated production payment gateway mode. When credentials
                    are set in application properties, real test keys trigger the
                    Razorpay SDK dialog.
                  </p>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--lime, #d9f06b)",
                      fontFamily: "monospace",
                    }}
                  >
                    STATUS: READY FOR GATEWAY TEST MODE
                  </span>
                </div>
              </div>
            )}

            {/* College Presentation Simulation Sandbox */}
            <div className="demo-simulation-panel">
              <div className="demo-title-row">
                <span className="demo-tag">Presentation Demo Control</span>
                <small style={{ color: "rgba(247, 241, 231, 0.6)" }}>
                  College Viva Testing
                </small>
              </div>
              <div className="demo-radio-group">
                <label>
                  <input
                    type="radio"
                    name="simResult"
                    checked={simulatedSuccess}
                    onChange={() => setSimulatedSuccess(true)}
                  />
                  Simulate Payment Success (Confirmed Order)
                </label>
                <label>
                  <input
                    type="radio"
                    name="simResult"
                    checked={!simulatedSuccess}
                    onChange={() => setSimulatedSuccess(false)}
                  />
                  Simulate Payment Failure (Declined)
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="payment-error-banner">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Processing state */}
            {loading && (
              <div className="processing-overlay">
                <div className="spinner-ring" />
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
                  {processingStep}
                </p>
                <small style={{ color: "rgba(247, 241, 231, 0.5)" }}>
                  Please do not refresh or navigate away
                </small>
              </div>
            )}

            {/* Pay Now Button */}
            {!loading && (
              <button type="submit" className="pay-now-button">
                <span>
                  {paymentMethod === "COD"
                    ? `Confirm Order (${formatPrice(totalAmount)}) →`
                    : `Pay ${formatPrice(totalAmount)} Securely →`}
                </span>
              </button>
            )}
          </form>

          <div className="security-assurance-badge">
            <span className="lock-icon">🔒</span>
            <span>
              End-to-end 256-bit encryption. Card CVV and payment credentials
              are never stored on our servers.
            </span>
          </div>
        </div>

        {/* Right column: Order Summary */}
        <div className="order-summary-card">
          <div className="section-title-wrap">
            <span className="eyebrow">Cart Verification</span>
            <h2>Order Summary</h2>
          </div>

          <div className="summary-items-list">
            {cart.map((item) => (
              <div className="summary-item-row" key={item.id}>
                <div className="summary-item-img">
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    item.product?.icon || "📦"
                  )}
                </div>
                <div className="summary-item-details">
                  <h4>{item.product?.name}</h4>
                  <p>
                    Qty: {item.quantity} × {formatPrice(item.product?.price)}
                  </p>
                </div>
                <div className="summary-item-price">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-cost-breakdown">
            <div className="summary-cost-line">
              <span>Items Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-cost-line free-tag">
              <span>Express Insured Shipping</span>
              <span>FREE</span>
            </div>

            <div className="summary-cost-line">
              <span>Custody Account</span>
              <span>{userEmail}</span>
            </div>

            <div className="summary-total-line">
              <span>Total Payable</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
