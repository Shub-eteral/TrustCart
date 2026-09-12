export function getCategoryIcon(category, name) {
  const c = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (c.includes("mob") || n.includes("phone") || n.includes("iphone")) return "📱";
  if (c.includes("elec") || n.includes("laptop") || n.includes("macbook")) return "💻";
  if (c.includes("fash") || n.includes("shirt") || n.includes("jacket")) return "👕";
  if (c.includes("audio") || n.includes("headphone") || n.includes("earphone")) return "🎧";
  if (c.includes("watch") || n.includes("smartwatch")) return "⌚";
  if (c.includes("shoe") || n.includes("sneaker")) return "👟";
  if (c.includes("home") || n.includes("decor")) return "🏠";
  if (c.includes("beauty") || n.includes("perfume")) return "✨";
  return "📦";
}

function getCategoryClass(category, name) {
  const value = `${category || ""} ${name || ""}`.toLowerCase();
  if (value.includes("phone") || value.includes("mobile") || value.includes("iphone")) return "tone-mobile";
  if (value.includes("laptop") || value.includes("macbook") || value.includes("elec")) return "tone-tech";
  if (value.includes("audio") || value.includes("headphone") || value.includes("earphone")) return "tone-audio";
  if (value.includes("watch") || value.includes("smartwatch")) return "tone-watch";
  if (value.includes("fashion") || value.includes("shirt") || value.includes("jacket")) return "tone-fashion";
  if (value.includes("shoe") || value.includes("sneaker")) return "tone-shoe";
  if (value.includes("home") || value.includes("decor")) return "tone-home";
  if (value.includes("beauty") || value.includes("perfume")) return "tone-beauty";
  return "tone-general";
}

export default function ProductCard({ product, onAddToCart }) {
  const icon = getCategoryIcon(product.category, product.name);
  const tone = getCategoryClass(product.category, product.name);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className={`product-img-wrap ${tone}`}>
        <div className="product-aura" />
        <div className="product-symbol" aria-hidden="true">
          {icon}
        </div>
        <div className="prod-hash-badge">
          <span>🛡️</span>
          <span>
            {product.productHash
              ? `${product.productHash.slice(0, 8)}...`
              : "VERIFIED"}
          </span>
        </div>
      </div>

      <div className="product-body">
        <div className="product-cat">{product.category || "General"}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-stars">
          <span className="stars">★★★★★</span>
          <span className="star-count">(4.9)</span>
        </div>

        <div className="product-footer">
          <div className="prod-price-wrap">
            <div className="product-price">
              ₹{(product.price || 0).toLocaleString("en-IN")}
            </div>
            <div className={`product-stock ${isOutOfStock ? "out" : ""}`}>
              {isOutOfStock ? "Out of Stock" : `${product.stock} in stock`}
            </div>
          </div>

          <button
            className="add-btn"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product.id)}
            title={isOutOfStock ? "Product Out of Stock" : "Add to Cart"}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
