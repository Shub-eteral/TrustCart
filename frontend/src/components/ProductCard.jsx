export function getProductImage(product) {
  const productName = (product?.name || "").toLowerCase();
  const catalogImages = [
    ["iphone", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=85"],
    ["galaxy", "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=85"],
    ["macbook", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=88"],
    ["sony", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"],
    ["bose", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85"],
    ["rolex", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85"],
    ["watch", "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85"],
    ["jordan", "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=85"],
  ];

  return (
    product?.imageUrl ||
    product?.imageURL ||
    product?.image ||
    catalogImages.find(([keyword]) => productName.includes(keyword))?.[1] ||
    null
  );
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

export default function ProductCard({ product, onAddToCart, onSelectProduct }) {
  const tone = getCategoryClass(product.category, product.name);
  const isOutOfStock = product.stock <= 0;
  const productMark = (product.category || product.name || "TC")
    .slice(0, 2)
    .toUpperCase();
  const imageUrl = getProductImage(product);

  return (
    <article
      className="product-card"
      tabIndex="0"
      role="button"
      onClick={() => onSelectProduct(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectProduct(product);
        }
      }}
      aria-label={`View details for ${product.name}`}
    >
      <div className={`product-img-wrap ${tone}`}>
        {imageUrl ? (
          <img className="product-image" src={imageUrl} alt={product.name} />
        ) : (
          <>
            <div className="product-aura" />
            <div className="product-symbol" aria-hidden="true">
              {productMark}
            </div>
          </>
        )}
        <div className="prod-hash-badge">
          <span>
            {product.productHash
              ? `${product.productHash.slice(0, 8)}...`
              : "HASH PENDING"}
          </span>
        </div>
      </div>

      <div className="product-body">
        <div className="product-cat">{product.category || "General"}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

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
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart(product.id);
            }}
            title={isOutOfStock ? "Product Out of Stock" : "Add to Cart"}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            <span className="add-mark" aria-hidden="true">+</span>
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
