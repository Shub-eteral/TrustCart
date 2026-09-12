import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  loading,
  categories,
  selectedCategory,
  onSelectCategory,
  search,
  onResetFilters,
  onAddToCart,
}) {
  return (
    <main className="products-section">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Verified Inventory</div>
          <h2 className="section-title">Authentic Products</h2>
        </div>

        {(search || selectedCategory !== "All") && (
          <button className="view-all-btn" onClick={onResetFilters}>
            Reset Filters ↺
          </button>
        )}
      </div>

      {/* Dynamic Categories filter */}
      <div className="cat-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="state-box">
          <div className="spinner" />
          <h3>Fetching Blockchain Products...</h3>
          <p>Querying verified database records</p>
        </div>
      ) : products.length === 0 ? (
        <div className="state-box">
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
          <h3>No matching products found</h3>
          <p>Try searching for a different keyword or category</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </main>
  );
}
