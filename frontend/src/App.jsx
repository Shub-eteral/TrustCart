import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080";

const groceryFallbackProducts = [
  { id: "grocery-mango", name: "Alphonso Mangoes", description: "Tree-ripened seasonal fruit, hand selected.", price: 349, stock: 18, category: "Groceries" },
  { id: "grocery-coffee", name: "Roasted Arabica Coffee", description: "Small-batch beans with a silky finish.", price: 599, stock: 24, category: "Groceries" },
  { id: "grocery-pasta", name: "Italian Bronze Pasta", description: "Slow-dried durum wheat pasta for dinner.", price: 189, stock: 42, category: "Groceries" },
  { id: "grocery-honey", name: "Wildflower Honey", description: "Raw, unfiltered honey from local apiaries.", price: 425, stock: 16, category: "Groceries" },
];

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showDeals, setShowDeals] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trustcart-wishlist") || "[]");
    } catch {
      return [];
    }
  });

  const [showAccount, setShowAccount] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProducts();

    if (token) {
      fetchCart();
    }
  }, []);

  // =========================
  // PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.length ? data : groceryFallbackProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts(groceryFallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CART
  // =========================

  const fetchCart = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          setCart([]);
          setCartCount(0);
          setCartError("Your session expired. Please sign in again.");
          setShowCart(false);
          setShowAccount(true);
          return;
        }
        throw new Error(`Cart request failed (${response.status})`);
      }

      const data = await response.json();

      setCart(data);
      setCartError("");

      const totalQuantity = data.reduce(
        (total, item) => total + item.quantity,
        0
      );

      setCartCount(totalQuantity);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartError("We couldn't reach your cart. Check that the backend is running, then retry.");
    }
  };

  // =========================
  // ORDERS
  // =========================

  const fetchOrders = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    setOrdersLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Please login first.");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to cancel order");
      }

      const cancelledOrder = await response.json();
      alert(`Order ${cancelledOrder.id} cancelled successfully!`);
      await fetchOrders();
    } catch (error) {
      console.error("Cancel order error:", error);
      alert(error.message || "Failed to cancel order");
    }
  };

  const addToCart = async (productId) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Please login first.");
      setShowAccount(true);
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart/add?productId=${productId}&quantity=1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not add product");
      }

      await fetchCart();

      alert("Product added to cart!");
    } catch (error) {
      console.error(error);
      alert("Failed to add product to cart.");
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    if (quantity < 1) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart/${cartItemId}?quantity=${quantity}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not update cart");
      }

      await fetchCart();
    } catch (error) {
      console.error(error);
      alert("Failed to update quantity.");
    }
  };

  const removeFromCart = async (cartItemId) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/cart/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not remove item");
      }

      await fetchCart();
    } catch (error) {
      console.error(error);
      alert("Failed to remove item.");
    }
  };

  const clearCart = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Could not clear cart");
      }

      await fetchCart();
    } catch (error) {
      console.error(error);
      alert("Failed to clear cart.");
    }
  };

  // =========================
  // CHECKOUT
  // =========================

  const checkout = async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      alert("Please login first.");
      setShowCart(false);
      setShowAccount(true);
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Checkout failed.");
      }

      const order = await response.json();

      await fetchCart();
      await fetchProducts();

      setShowCart(false);

      alert(
        `Order placed successfully!\n\nOrder ID: ${order.id}\nTotal: ₹${order.totalAmount.toLocaleString(
          "en-IN"
        )}\n\nBlockchain Hash:\n${order.blockchainHash}`
      );
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.message || "Checkout failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleAccountClick = () => {
    setShowAccount(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password.");
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      } else if (typeof data === "string") {
        localStorage.setItem("token", data);
      } else {
        throw new Error(
          "Login successful but no token was returned."
        );
      }

      alert("Login successful!");

      setShowAccount(false);

      setEmail("");
      setPassword("");

      window.location.reload();
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoginLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "USER",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Registration failed.");
      }

      alert("Registration successful! Please login.");

      setIsRegister(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message || "Registration failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem("token");

    setCart([]);
    setCartCount(0);
    setShowAccount(false);

    window.location.reload();
  };

  // =========================
  // FILTER
  // =========================

  const filteredProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.description} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || product.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesDeals = !showDeals || product.price < 500;
    return matchesSearch && matchesCategory && matchesDeals;
  });

  const categories = [...new Set(["All", ...products.map((product) => product.category).filter(Boolean), "Groceries"] )];

  const toggleWishlist = (productId) => {
    const nextWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(nextWishlist);
    localStorage.setItem("trustcart-wishlist", JSON.stringify(nextWishlist));
  };

  // =========================
  // CART TOTAL
  // =========================

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      item.product.price * item.quantity,
    0
  );

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="logo">
          Trust<span>Cart</span>
        </div>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button>
            🔍
          </button>

        </div>

        <div className="nav-actions">

          <button
            className="nav-link"
            onClick={handleAccountClick}
          >
            👤 Account
          </button>

          <button
            className="nav-link"
            onClick={() => {
              if (!token) {
                alert("Please login first.");
                setShowAccount(true);
                return;
              }
              fetchOrders();
              setShowOrders(true);
            }}
          >
            📦 Orders
          </button>

          <button
            className="cart-button"
            onClick={() => {
              if (!token) {
                alert("Please login first.");
                setShowAccount(true);
                return;
              }

              fetchCart();
              setShowCart(true);
            }}
          >
            🛒 Cart

            <span className="cart-count">
              {cartCount}
            </span>

          </button>

        </div>

      </header>


      {/* ================= CATEGORY BAR ================= */}

      <nav className="category-bar">

        {categories.map((category) => (
          <button
            className={activeCategory === category ? "category-active" : ""}
            key={category}
            onClick={() => setActiveCategory(category)}
          >
            {category === "All" ? "☰ All" : category}
          </button>
        ))}
        <button
          className={showDeals ? "category-active" : ""}
          onClick={() => {
            setShowDeals(true);
            setSearch("");
            setActiveCategory("All");
          }}
        >
          Today's Deals
        </button>

      </nav>


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-content">

          <p className="hero-small">
            WELCOME TO
          </p>

          <h1>
            Shop smarter with
            <br />
            <span>TrustCart</span>
          </h1>

          <p className="hero-description">
            Discover great products with secure shopping,
            transparent orders and blockchain verification.
          </p>

          <button
            className="shop-button"
            onClick={() => {
              document
                .querySelector(".products-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }}
          >
            Shop Now →
          </button>

        </div>


        <div className="hero-card">

          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-object" aria-label="Glossy TrustCart package">
            <div className="object-gloss" />
            <div className="object-mark">TC</div>
            <div className="object-line line-one" />
            <div className="object-line line-two" />
            <div className="object-seal">✓</div>
          </div>
          <div className="hero-shadow" />

          <div className="hero-card-copy">
            <span className="hero-card-kicker">TRUSTED BY DESIGN</span>
            <h2>Secure Shopping</h2>
            <p>Every order is protected, trackable and verified on our blockchain.</p>
          </div>

        </div>

      </section>


      {/* ================= PRODUCTS ================= */}

      <main className="products-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              EXPLORE
            </p>

            <h2>
              Popular Products
            </h2>

          </div>

          <button
            className="view-all"
            onClick={() => {
              setSearch("");
              setActiveCategory("All");
              setShowDeals(false);
            }}
          >
            View All →
          </button>

        </div>


        {loading ? (

          <div className="loading">
            Loading products...
          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="empty">
            No products found.
          </div>

        ) : (

          <div className="product-grid">

            {filteredProducts.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                <div className={`product-image product-image-${product.category?.toLowerCase().replace(/\s+/g, "-")}`}>
                  {product.category?.toLowerCase().includes("groc") ? "🥭" : "📱"}
                  <button
                    className={`wishlist-button ${wishlist.includes(product.id) ? "is-wishlisted" : ""}`}
                    aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={() => toggleWishlist(product.id)}
                  >
                    {wishlist.includes(product.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="product-info">

                  <span className="category">
                    {product.category}
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <p className="description">
                    {product.description}
                  </p>

                  <div className="rating">
                    ⭐⭐⭐⭐⭐
                  </div>

                  <div className="product-bottom">

                    <div>

                      <p className="price">
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <p className="stock">

                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}

                      </p>

                    </div>

                    <button
                      className="add-button"
                      disabled={
                        product.stock <= 0
                      }
                      onClick={() =>
                        addToCart(product.id)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>


      {/* ================= FEATURES ================= */}

      <section className="features">

        <div className="feature">

          <div>🚚</div>

          <h3>
            Fast Delivery
          </h3>

          <p>
            Quick and reliable delivery.
          </p>

        </div>


        <div className="feature">

          <div>🔒</div>

          <h3>
            Secure Payments
          </h3>

          <p>
            Your shopping data stays protected.
          </p>

        </div>


        <div className="feature">

          <div>⛓️</div>

          <h3>
            Blockchain Verified
          </h3>

          <p>
            Verify the authenticity of your orders.
          </p>

        </div>


        <div className="feature">

          <div>💬</div>

          <h3>
            Customer Support
          </h3>

          <p>
            We're here whenever you need help.
          </p>

        </div>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <div className="footer-logo">
          Trust<span>Cart</span>
        </div>

        <p>
          Secure shopping. Transparent orders. Trusted commerce.
        </p>

        <p className="copyright">
          © 2026 TrustCart
        </p>

      </footer>


      {/* ================= ACCOUNT MODAL ================= */}

      {showAccount && (

        <div
          className="account-overlay"
          onClick={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowAccount(false);
            }
          }}
        >

          <div className="account-modal">

            <button
              className="close-button"
              onClick={() =>
                setShowAccount(false)
              }
            >
              ✕
            </button>


            {token ? (

              <>
                <div className="account-icon">
                  👤
                </div>

                <h2>
                  Welcome Back
                </h2>

                <p>
                  You are currently logged in.
                </p>

                <button
                  className="account-action"
                  onClick={logout}
                >
                  Logout
                </button>
              </>

            ) : (

              <>

                <div className="account-icon">
                  {isRegister
                    ? "📝"
                    : "🔐"}
                </div>

                <h2>
                  {isRegister
                    ? "Create Account"
                    : "Welcome Back"}
                </h2>

                <p>
                  {isRegister
                    ? "Create your TrustCart account."
                    : "Login to continue shopping."}
                </p>


                {isRegister ? (

                  <form
                    onSubmit={handleRegister}
                  >

                    <input
                      className="account-input"
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                    />

                    <input
                      className="account-input"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                    />

                    <input
                      className="account-input"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                    />

                    <button
                      className="account-action"
                      type="submit"
                      disabled={loginLoading}
                    >
                      {loginLoading
                        ? "Creating Account..."
                        : "Create Account"}
                    </button>

                  </form>

                ) : (

                  <form
                    onSubmit={handleLogin}
                  >

                    <input
                      className="account-input"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                    />

                    <input
                      className="account-input"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                    />

                    <button
                      className="account-action"
                      type="submit"
                      disabled={loginLoading}
                    >
                      {loginLoading
                        ? "Logging in..."
                        : "Login"}
                    </button>

                  </form>

                )}


                <button
                  className="switch-account"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                >
                  {isRegister
                    ? "Already have an account? Login"
                    : "Don't have an account? Register"}
                </button>

              </>

            )}

          </div>

        </div>

      )}


      {/* ================= CART MODAL ================= */}

      {cartError && !showCart && (
        <div className="cart-error-toast" role="alert">
          <span>{cartError}</span>
          <button onClick={() => fetchCart()}>Retry cart</button>
        </div>
      )}

      {showCart && (

        <div
          className="cart-overlay"
          onClick={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowCart(false);
            }
          }}
        >

          <div className="cart-modal">

            <div className="cart-header">

              <h2>
                🛒 Your Cart
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setShowCart(false)
                }
              >
                ✕
              </button>

            </div>


            {cartError ? (
              <div className="empty-cart cart-recovery">
                <div className="empty-cart-icon">⚡</div>
                <h3>Cart connection interrupted</h3>
                <p>{cartError}</p>
                <button className="account-action" onClick={fetchCart}>Retry cart</button>
              </div>
            ) : cart.length === 0 ? (

              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>
                  Your cart is empty
                </h3>

                <p>
                  Add some products to get started.
                </p>

                <button
                  className="account-action"
                  onClick={() =>
                    setShowCart(false)
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item) => (

                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      <div className="cart-item-image">
                        📱
                      </div>


                      <div className="cart-item-info">

                        <h3>
                          {item.product.name}
                        </h3>

                        <p>
                          ₹
                          {item.product.price.toLocaleString(
                            "en-IN"
                          )}
                        </p>


                        <div className="quantity-controls">

                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.id,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>


                      <div className="cart-item-right">

                        <strong>
                          ₹
                          {(
                            item.product.price *
                            item.quantity
                          ).toLocaleString("en-IN")}
                        </strong>

                        <button
                          className="remove-button"
                          onClick={() =>
                            removeFromCart(item.id)
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>

                  ))}

                </div>


                <div className="cart-summary">

                  <div className="summary-row">

                    <span>
                      Items
                    </span>

                    <span>
                      {cartCount}
                    </span>

                  </div>


                  <div className="summary-row total-row">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {cartTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>


                  <button
                    className="checkout-button"
                    onClick={checkout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading
                      ? "Placing Order..."
                      : "Proceed to Checkout →"}
                  </button>


                  <button
                    className="clear-cart-button"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}

      {/* ================= ORDERS MODAL ================= */}

      {showOrders && (

        <div
          className="orders-overlay"
          onClick={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setShowOrders(false);
            }
          }}
        >

          <div className="orders-modal">

            <div className="orders-header">

              <h2>
                📦 Your Orders
              </h2>

              <button
                className="close-button"
                onClick={() =>
                  setShowOrders(false)
                }
              >
                ✕
              </button>

            </div>

            {ordersLoading ? (

              <div className="loading">
                Loading orders...
              </div>

            ) : orders.length === 0 ? (

              <div className="empty-orders">

                <div className="empty-orders-icon">
                  📦
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  Your orders will appear here.
                </p>

                <button
                  className="account-action"
                  onClick={() =>
                    setShowOrders(false)
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <div className="orders-list">

                {orders.map((order) => (

                  <div
                    className="order-card"
                    key={order.id}
                  >

                    <div className="order-header">

                      <div>

                        <h3>
                          Order #{order.id}
                        </h3>

                        <p className="order-date">
                          {new Date(order.orderDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>

                      </div>

                      <span
                        className={`order-status ${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>

                    </div>

                    <div className="order-details">

                      <div className="order-items-preview">
                        {order.items ? order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="order-item-preview">
                            <span>{item.product.name} × {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        )) : (
                          <span>Loading items...</span>
                        )}
                        {order.items && order.items.length > 3 && (
                          <span className="more-items">
                            +{order.items.length - 3} more items
                          </span>
                        )}
                      </div>

                      <div className="order-summary">

                        <div className="summary-row">
                          <span>Total</span>
                          <strong>₹{order.totalAmount.toLocaleString("en-IN")}</strong>
                        </div>

                        {order.blockchainHash && (
                          <div className="blockchain-hash">
                            <span>Blockchain: </span>
                            <code>{order.blockchainHash.substring(0, 32)}...</code>
                          </div>
                        )}

                      </div>

                    </div>

                    <div className="order-actions">

                      {["PLACED", "CONFIRMED"].includes(order.status) && (
                        <button
                          className="cancel-button"
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}

                      <button
                        className="view-button"
                        onClick={() => alert("Order details view coming soon!")}
                      >
                        View Details
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default App;