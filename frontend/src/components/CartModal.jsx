import { getCategoryIcon } from "./ProductCard";

export default function CartModal({
  isOpen,
  onClose,
  cart,
  cartCount,
  cartTotal,
  checkoutLoading,
  lastPlacedOrder,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onViewOrders,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="drawer-head">
          <h2>
            <span>🛒</span> Cryptographic Cart ({cartCount})
          </h2>
          <button className="close-x" onClick={onClose}>
            ✕
          </button>
        </div>

        {lastPlacedOrder ? (
          <div className="checkout-ok">
            <div className="check-circle">✓</div>
            <h2>Order Mined Successfully!</h2>
            <p>
              Your transaction has been permanently written to the blockchain
              ledger.
            </p>

            <div className="hash-box">
              <div className="lbl">ORDER ID</div>
              <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                #{lastPlacedOrder.id} (₹
                {Number(lastPlacedOrder.totalAmount || 0).toLocaleString("en-IN")})
              </div>
              <div className="lbl">BLOCKCHAIN MERKLE/BLOCK HASH</div>
              <div className="val">{lastPlacedOrder.blockchainHash}</div>
            </div>

            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={onViewOrders}
            >
              View in Ledger History →
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <div className="big-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Select verified items from our authentic catalog</p>
            <button
              className="btn-primary"
              style={{ marginTop: "12px" }}
              onClick={onClose}
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div className="cart-row-img">
                    {getCategoryIcon(item.product?.category, item.product?.name)}
                  </div>

                  <div className="cart-row-info">
                    <div className="cart-row-name">{item.product?.name}</div>
                    <div className="cart-row-unit">
                      ₹{(item.product?.price || 0).toLocaleString("en-IN")} each
                    </div>

                    <div className="qty-row">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="qty-num">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={
                          item.quantity >= (item.product?.stock || 999)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-row-right">
                    <div className="cart-row-total">
                      ₹
                      {(
                        (item.product?.price || 0) * item.quantity
                      ).toLocaleString("en-IN")}
                    </div>
                    <button
                      className="cart-remove"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-foot">
              <div className="cart-sum-row">
                <span>Items Subtotal</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="cart-sum-row">
                <span>Cryptographic Verification</span>
                <span style={{ color: "var(--green)" }}>FREE (ON-CHAIN)</span>
              </div>
              <div className="cart-sum-total">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                className="checkout-btn"
                disabled={checkoutLoading}
                onClick={onCheckout}
              >
                {checkoutLoading
                  ? "⚡ Mining Order onto Chain..."
                  : "Proceed to Checkout →"}
              </button>

              <button className="clear-btn" onClick={onClearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
