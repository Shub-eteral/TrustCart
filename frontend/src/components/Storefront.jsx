import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useState } from "react";
import LuxuryScene from "./scene/LuxuryScene.jsx";
import MagneticButton from "./ui/MagneticButton.jsx";
import PaymentPage from "./PaymentPage.jsx";
import OrderConfirmationPage from "./OrderConfirmationPage.jsx";
import OrdersPage from "./OrdersPage.jsx";

gsap.registerPlugin(ScrollTrigger);

const API_URL =
  (typeof window !== "undefined" && window.location && window.location.hostname)
    ? `http://${window.location.hostname}:8080`
    : "http://localhost:8080";
const fallbackProducts = [
  { id: "fallback-mango", name: "Alphonso Mangoes", description: "Tree-ripened seasonal fruit, hand selected.", price: 349, category: "Groceries", icon: "🥭", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=85" },
  { id: "fallback-coffee", name: "Roasted Arabica Coffee", description: "Small-batch beans with a silky finish.", price: 599, category: "Groceries", icon: "☕", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85" },
  { id: "fallback-pasta", name: "Italian Bronze Pasta", description: "Slow-dried durum wheat pasta for dinner.", price: 189, category: "Groceries", icon: "🍝", image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=900&q=85" },
  { id: "fallback-honey", name: "Wildflower Honey", description: "Raw, unfiltered honey from local apiaries.", price: 425, category: "Groceries", icon: "🍯", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85" },
];

const productImages = {
  "iPhone 17": "https://images.unsplash.com/photo-1592286927505-1def25115558?auto=format&fit=crop&w=900&q=85",
  "Alphonso Mangoes": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=85",
  "Roasted Arabica Coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
  "Wildflower Honey": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85",
};

const getProductImageUrl = (product) =>
  product.imageUrl || product.imageURL || product.image || productImages[product.name];

const formatPrice = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

function AuthModal({ open, onClose, onSuccess }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/users/${register ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(register ? form : { email: form.email, password: form.password }),
      });
      if (!response.ok) {
        let msg = register ? "Registration failed." : "Invalid email or password.";
        try {
          const data = await response.json();
          if (data && (data.message || data.error)) {
            msg = data.message || data.error;
          }
        } catch (_) {
          const text = await response.text();
          if (text) msg = text;
        }
        throw new Error(msg);
      }
      const data = await response.json();
      if (register) {
        setRegister(false);
        setError("Account created! Please enter your password to sign in.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email || form.email);
      onSuccess(data);
      onClose();
    } catch (requestError) {
      if (requestError.message && requestError.message.includes("Failed to fetch")) {
        setError("Cannot reach backend server. Please make sure the Spring Boot server is running on port 8080.");
      } else {
        setError(requestError.message || "Authentication failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.form
            className="auth-card"
            onSubmit={submit}
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close sign in">
              ×
            </button>
            <span className="eyebrow">Trust layer access</span>
            <h2 className="display modal-title">{register ? "Create your account." : "Welcome back."}</h2>
            <p className="muted">
              {register ? "Join a marketplace built around cryptographic proof." : "Sign in to verify and track your orders."}
            </p>
            {register && (
              <label>
                Name
                <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            )}
            <label>
              Email
              <input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label>
              Password
              <input type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </label>
            <p className={error.startsWith("Account") ? "auth-success" : "auth-error"}>{error}</p>
            <MagneticButton type="submit" className="button button-primary auth-submit">
              {busy ? "Connecting..." : register ? "Create account →" : "Sign in →"}
            </MagneticButton>
            <button
              type="button"
              className="modal-switch"
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register ? "Already have an account? Sign in" : "Need an account? Create one"}
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ open, onClose, cart, onRemove, onCheckout, checkoutBusy }) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="cart-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
        >
          <div className="drawer-head">
            <div>
              <span className="eyebrow">Your selection</span>
              <h2 className="display">Cart</h2>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Close cart">
              ×
            </button>
          </div>
          {cart.length === 0 ? (
            <p className="muted">Your cart is waiting for its first considered purchase.</p>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <motion.div layout key={item.id} className="cart-row">
                  <div>
                    <strong>{item.product.name}</strong>
                    <small>Qty {item.quantity}</small>
                  </div>
                  <div className="cart-price">
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                    <button onClick={() => onRemove(item.id)}>Remove</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="drawer-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          {cart.length > 0 && (
            <button className="button button-primary checkout-button" disabled={checkoutBusy} onClick={onCheckout}>
              {checkoutBusy ? "Opening Gateway..." : "Proceed to Payment →"}
            </button>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default function Storefront() {
  const [products, setProducts] = useState(fallbackProducts);
  const [cart, setCart] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [view, setView] = useState("store"); // 'store' | 'payment' | 'confirmation' | 'orders'
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail") || "customer@trustcart.io";

  const loadCart = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return setCart([]);
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!response.ok) {
        localStorage.removeItem("token");
        return setCart([]);
      }
      setCart(await response.json());
    } catch {
      setCart([]);
    }
  };

  const loadOrders = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;
    setOrdersLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (response.ok) {
        setUserOrders(await response.json());
      }
    } catch (err) {
      console.warn("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (data.length) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (token) loadCart().catch(() => {});
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => setScrollProgress(self.progress),
    });
    return () => trigger.kill();
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 4), [products]);

  const addToCart = async (product) => {
    if (!localStorage.getItem("token")) return setAuthOpen(true);
    if (String(product.id).startsWith("fallback"))
      return setToast("Connect catalog to purchase this item.");

    const response = await fetch(
      `${API_URL}/api/cart/add?productId=${product.id}&quantity=1`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    if (!response.ok) return setToast("We could not add that item right now.");
    await loadCart();
    setCartOpen(true);
    setToast(`${product.name} added to cart`);
    setTimeout(() => setToast(""), 2400);
  };

  const removeFromCart = async (id) => {
    const response = await fetch(`${API_URL}/api/cart/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (response.ok) loadCart();
  };

  // Navigates to dedicated payment page when user clicks checkout
  const handleProceedToPayment = () => {
    if (!localStorage.getItem("token")) {
      setAuthOpen(true);
      return;
    }
    if (!cart.length) {
      setToast("Your cart is empty.");
      setTimeout(() => setToast(""), 2400);
      return;
    }
    setCartOpen(false);
    setView("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrdersNav = () => {
    if (!localStorage.getItem("token")) {
      setAuthOpen(true);
      return;
    }
    loadOrders();
    setView("orders");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setCart([]);
    setView("store");
    setToast("Signed out successfully");
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <div className="storefront">
      <div className="scene-layer">
        <LuxuryScene scrollProgress={scrollProgress} />
      </div>

      {/* Navigation Header */}
      <header className="site-header">
        <a
          className="brand display"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setView("store");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Trust<span>Cart</span>
          <b>.</b>
        </a>

        <nav>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setView("store");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Storefront
          </a>
          <a
            href="#collection"
            onClick={(e) => {
              if (view !== "store") {
                setView("store");
                setTimeout(
                  () =>
                    document
                      .querySelector("#collection")
                      ?.scrollIntoView({ behavior: "smooth" }),
                  100
                );
              } else {
                document
                  .querySelector("#collection")
                  ?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Collection
          </a>
          <a
            href="#orders"
            onClick={(e) => {
              e.preventDefault();
              handleOrdersNav();
            }}
          >
            Ledger &amp; Orders
          </a>
        </nav>

        <div className="header-actions">
          {token ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button className="header-link" onClick={handleOrdersNav}>
                Ledger
              </button>
              <button
                className="header-link"
                style={{ opacity: 0.6 }}
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button className="header-link" onClick={() => setAuthOpen(true)}>
              Sign in
            </button>
          )}

          <MagneticButton
            className="button button-primary cart-button"
            onClick={() => {
              setCartOpen(true);
              loadCart();
            }}
          >
            Cart{" "}
            <span>
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </MagneticButton>
        </div>
      </header>

      {/* VIEW SWITCHING */}
      {view === "payment" && (
        <PaymentPage
          cart={cart}
          token={token}
          userEmail={userEmail}
          onBack={() => setView("store")}
          onPaymentSuccess={(confirmed) => {
            setConfirmedOrder(confirmed);
            loadCart();
            setView("confirmation");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {view === "confirmation" && (
        <OrderConfirmationPage
          order={confirmedOrder}
          token={token}
          onContinueShopping={() => {
            setView("store");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onViewOrders={handleOrdersNav}
        />
      )}

      {view === "orders" && (
        <OrdersPage
          orders={userOrders}
          loading={ordersLoading}
          userEmail={userEmail}
          token={token}
          onNavigateHome={() => {
            setView("store");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onRefreshOrders={loadOrders}
        />
      )}

      {view === "store" && (
        <main id="top">
          <section className="hero-section">
            <div className="content-frame">
              <span className="eyebrow">Blockchain-Secured Luxury Commerce</span>
              <h1 className="display hero-title">
                Objects with
                <br />
                <em>provenance.</em>
              </h1>
              <p className="hero-lede">
                A considered collection of beautiful things, backed by
                immutable SHA-256 blockchain verification and secure payment
                processing.
              </p>
              <div className="hero-actions">
                <MagneticButton
                  className="button button-primary"
                  onClick={() =>
                    document
                      .querySelector("#collection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Shop the collection →
                </MagneticButton>
                <a
                  className="text-link"
                  href="#proof"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#proof")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Discover the standard <span>↘</span>
                </a>
              </div>
              <div className="hero-proof">
                <span>SHA-256 Linked Blocks</span>
                <span>Real-Time Tamper Detection</span>
                <span>Multi-Rail Secure Payments</span>
              </div>
            </div>
          </section>

          <section id="proof" className="content-section">
            <div className="content-frame">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">The TrustCart Standard</span>
                  <h2 className="display section-title">
                    Commerce is
                    <br />
                    <em>knowing.</em>
                  </h2>
                </div>
                <p className="section-note">
                  Every order is minted into an immutable cryptographic block.
                  Any modification to prices, dates, or items is caught
                  instantly.
                </p>
              </div>
              <div className="principles">
                <article>
                  <span>01</span>
                  <h3>Immutable Blockchain</h3>
                  <p>
                    Every completed transaction is sealed using SHA-256 and
                    linked to the previous block in our application ledger.
                  </p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Instant Tamper Detection</h3>
                  <p>
                    Our verification API recalibrates cryptographic hashes on
                    the fly, flagging any unauthorized database tampering.
                  </p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Multi-Method Payments</h3>
                  <p>
                    Pay securely via UPI QR, Cards, or Cash on Delivery,
                    integrated seamlessly into our order ledger.
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section id="collection" className="content-section collection-section">
            <div className="content-frame">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">The current edit</span>
                  <h2 className="display section-title">
                    A finer
                    <br />
                    <em>selection.</em>
                  </h2>
                </div>
                <p className="section-note">
                  Small-batch essentials and luxury goods, verified on the
                  chain.
                </p>
              </div>

              {loading ? (
                <div className="loading-state">Composing the collection...</div>
              ) : (
                <div className="product-grid">
                  {featuredProducts.map((product, index) => (
                    <motion.article
                      className="product-card"
                      key={product.id}
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ delay: index * 0.08, duration: 0.6 }}
                      whileHover={{ y: -10 }}
                    >
                      <div className={`product-art art-${index % 4}`}>
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span>
                          {product.icon || ["📦", "◈", "✦", "◇"][index % 4]}
                        </span>
                        <b>Verified</b>
                      </div>
                      <div className="product-copy">
                        <small>{product.category}</small>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <div className="product-footer">
                          <strong>{formatPrice(product.price)}</strong>
                          <button onClick={() => addToCart(product)}>
                            Add to cart <span>+</span>
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="contact" className="contact-section">
            <div className="content-frame contact-panel">
              <span className="eyebrow">Academic &amp; Project Demo</span>
              <h2 className="display section-title">
                TrustCart
                <br />
                <em>Blockchain Architecture.</em>
              </h2>
              <p className="section-note">
                Built with Java Spring Boot, PostgreSQL, SHA-256 cryptographic
                hashing, and modern React.js.
              </p>
              <MagneticButton
                className="button button-primary"
                onClick={handleOrdersNav}
              >
                Inspect Ledger Transactions →
              </MagneticButton>
            </div>
          </section>
        </main>
      )}

      <footer className="site-footer">
        <span className="brand display">
          Trust<span>Cart</span>
          <b>.</b>
        </span>
        <span>© 2026 TrustCart. Blockchain-Based Secure E-Commerce.</span>
        <span>Cryptographic Proof / SHA-256</span>
      </footer>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          loadCart();
          setToast("Welcome to TrustCart");
          setTimeout(() => setToast(""), 2400);
        }}
      />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onRemove={removeFromCart}
        onCheckout={handleProceedToPayment}
        checkoutBusy={checkoutBusy}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
