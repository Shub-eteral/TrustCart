import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAccount, setShowAccount] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginLoading, setLoginLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
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
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();

      setCart(data);

      const totalQuantity = data.reduce(
        (total, item) => total + item.quantity,
        0
      );

      setCartCount(totalQuantity);
    } catch (error) {
      console.error("Error loading cart:", error);
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

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
            onClick={() =>
              alert("Orders page coming next.")
            }
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

        <span>☰ All</span>
        <span>Electronics</span>
        <span>Mobiles</span>
        <span>Fashion</span>
        <span>Home</span>
        <span>Beauty</span>
        <span>Groceries</span>
        <span>Today's Deals</span>

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

          <div className="hero-icon">
            🛍️
          </div>

          <h2>
            Secure Shopping
          </h2>

          <p>
            Every order can be verified on our blockchain.
          </p>

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
            onClick={() => setSearch("")}
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

                <div className="product-image">
                  📱
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


            {cart.length === 0 ? (

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

    </div>
  );
}

export default App;