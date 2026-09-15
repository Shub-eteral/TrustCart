import TrustCartLogo from "./TrustCartLogo";

export default function Navbar({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  cartCount,
  userEmail,
  token,
  onOpenAccount,
  onOpenCart,
  showToast,
}) {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <a
          href="/"
          className="logo-btn"
          aria-label="TrustCart — Home"
          onClick={(event) => {
            event.preventDefault();
            window.history.pushState({}, "", "/");
            setActiveTab("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <TrustCartLogo variant="compact" dark />
        </a>

        {activeTab === "home" && (
          <div className="nav-search">
            <span className="nav-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search verified products, hashes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        <div className="nav-actions">
          <button
            className={`nav-btn ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            Catalog
          </button>

          <button
            className={`nav-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => {
              if (!token) {
                showToast("Please login to view verified orders", "error");
                onOpenAccount();
                return;
              }
              setActiveTab("orders");
            }}
          >
            Orders
          </button>

          <button className="nav-btn" onClick={onOpenAccount}>
            {userEmail ? userEmail.split("@")[0] : "Account"}
          </button>

          <button
            className="cart-nav-btn"
            onClick={() => {
              if (!token) {
                showToast("Please sign in to view cart", "error");
                onOpenAccount();
                return;
              }
              onOpenCart();
            }}
          >
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
