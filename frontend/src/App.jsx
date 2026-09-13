import { useEffect, useState, useMemo } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import ProductDetailModal from "./components/ProductDetailModal";
import OrdersPage from "./components/OrdersPage";
import CartModal from "./components/CartModal";
import AuthModal from "./components/AuthModal";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

const API_URL = "http://localhost:8080";

export default function App() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState("home"); // "home" | "orders"

  // Core Data
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  // Modals
  const [showAccount, setShowAccount] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // Authentication Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );

  // Loading States
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState({});
  const [verificationResult, setVerificationResult] = useState({});
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const token = localStorage.getItem("token");

  // Initial Load
  useEffect(() => {
    fetchProducts();
    if (token) {
      fetchCart();
    }
  }, [token]);

  // Load Orders on tab switch
  useEffect(() => {
    if (activeTab === "orders" && token) {
      fetchOrders();
    }
  }, [activeTab, token]);

  // =========================
  // PRODUCTS LOGIC
  // =========================
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      showToast("Unable to reach backend products API", "error");
    } finally {
      setProductsLoading(false);
    }
  };

  // Extract dynamic categories from products
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // =========================
  // CART LOGIC
  // =========================
  const fetchCart = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) throw new Error("Failed to load cart");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (item.product?.price || 0) * item.quantity,
      0
    );
  }, [cart]);

  const addToCart = async (productId) => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      showToast("Please sign in to add products to your cart", "error");
      setShowAccount(true);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/api/cart/add?productId=${productId}&quantity=1`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to add product");
      }
      await fetchCart();
      showToast("Product added to cryptographically secured cart!");
    } catch (err) {
      showToast(err.message || "Failed to add to cart", "error");
    }
  };

  const updateCartQuantity = async (cartItemId, newQty) => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken || newQty < 1) return;

    try {
      const res = await fetch(
        `${API_URL}/api/cart/${cartItemId}?quantity=${newQty}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      if (!res.ok) throw new Error("Could not update quantity");
      await fetchCart();
    } catch (err) {
      showToast("Failed to update cart quantity", "error");
    }
  };

  const removeFromCart = async (cartItemId) => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await fetch(`${API_URL}/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) throw new Error("Could not remove item");
      await fetchCart();
      showToast("Item removed from cart");
    } catch (err) {
      showToast("Failed to remove item", "error");
    }
  };

  const clearCart = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await fetch(`${API_URL}/api/cart/clear`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      await fetchCart();
      showToast("Cart emptied");
    } catch (err) {
      showToast("Failed to clear cart", "error");
    }
  };

  // =========================
  // CHECKOUT LOGIC
  // =========================
  const checkout = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      showToast("Please authenticate first", "error");
      setShowCart(false);
      setShowAccount(true);
      return;
    }
    if (cart.length === 0) {
      showToast("Your cart is empty", "error");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Checkout failed");
      }

      const order = await res.json();
      setLastPlacedOrder(order);
      await fetchCart();
      await fetchProducts();
      showToast("Order mined onto blockchain successfully!", "success");
    } catch (err) {
      console.error("Checkout error:", err);
      showToast(err.message || "Checkout failed", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // =========================
  // ORDERS & BLOCKCHAIN VERIFY
  // =========================
  const fetchOrders = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data.reverse() : []);
    } catch (err) {
      console.error(err);
      showToast("Error loading orders", "error");
    } finally {
      setOrdersLoading(false);
    }
  };

  const verifyOrderBlockchain = async (orderId) => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    setVerifyingOrder((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/verify`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const message = await res.text();
      const isValid = res.ok && message.toLowerCase().includes("authentic");

      setVerificationResult((prev) => ({
        ...prev,
        [orderId]: {
          isValid,
          message,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));

      if (isValid) {
        showToast(
          `Order #${orderId} verified on cryptographic ledger!`,
          "success"
        );
      } else {
        showToast(`Warning: Order #${orderId} failed verification`, "error");
      }
    } catch (err) {
      setVerificationResult((prev) => ({
        ...prev,
        [orderId]: {
          isValid: false,
          message: "Verification network error",
        },
      }));
      showToast("Blockchain verification error", "error");
    } finally {
      setVerifyingOrder((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // =========================
  // AUTHENTICATION LOGIC
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please provide both email and password", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid email or password");
      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email || email);
        localStorage.setItem("userRole", data.role || "CUSTOMER");
        setUserEmail(data.email || email);
        setUserRole(data.role || "CUSTOMER");
      } else {
        throw new Error("No token returned from server");
      }

      showToast("Authenticated successfully!");
      setShowAccount(false);
      setEmail("");
      setPassword("");
      fetchCart();
    } catch (err) {
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast("Please fill all fields", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "CUSTOMER" }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Registration failed");
      }

      showToast("Account created! Please login now.");
      setIsRegister(false);
      setName("");
      setPassword("");
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    setUserEmail("");
    setUserRole("");
    setCart([]);
    setOrders([]);
    setShowAccount(false);
    showToast("Signed out safely");
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  return (
    <div className="app">
      {/* Toast Notifications */}
      <Toast toasts={toasts} />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
        userEmail={userEmail}
        token={token}
        onOpenAccount={() => setShowAccount(true)}
        onOpenCart={() => {
          setLastPlacedOrder(null);
          setShowCart(true);
        }}
        showToast={showToast}
      />

      {/* Main Pages */}
      {activeTab === "home" ? (
        <>
          <Hero
            token={token}
            onOpenAccount={() => setShowAccount(true)}
            setActiveTab={setActiveTab}
            lastPlacedOrder={lastPlacedOrder}
          />

          <ProductGrid
            products={filteredProducts}
            loading={productsLoading}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            search={search}
            onResetFilters={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            onAddToCart={addToCart}
            onSelectProduct={setSelectedProduct}
          />

          <Features />
        </>
      ) : (
        <OrdersPage
          orders={orders}
          loading={ordersLoading}
          userEmail={userEmail}
          verifyingOrder={verifyingOrder}
          verificationResult={verificationResult}
          onVerifyOrder={verifyOrderBlockchain}
          onCopyToClipboard={copyToClipboard}
          onNavigateHome={() => setActiveTab("home")}
        />
      )}

      {/* Footer */}
      <Footer />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Slide-over Cart Drawer */}
      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        checkoutLoading={checkoutLoading}
        lastPlacedOrder={lastPlacedOrder}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={checkout}
        onViewOrders={() => {
          setShowCart(false);
          setActiveTab("orders");
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAccount}
        onClose={() => setShowAccount(false)}
        token={token}
        userEmail={userEmail}
        userRole={userRole}
        isRegister={isRegister}
        setIsRegister={setIsRegister}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loginLoading={loginLoading}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onViewOrders={() => setActiveTab("orders")}
      />
    </div>
  );
}