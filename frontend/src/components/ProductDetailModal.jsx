import { getProductImage } from "./ProductCard";

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}) {
  if (!product) return null;

  const productHash = product.productHash || "Hash pending from catalog API";
  const productId = product.id ? `TC-PROD-${String(product.id).padStart(5, "0")}` : "Pending";
  const isOutOfStock = product.stock <= 0;
  const imageUrl = getProductImage(product);

  return (
    <div
      className="detail-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="product-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close product details">
          Close
        </button>

        <div className="detail-layout">
          <div className="detail-visual" aria-hidden="true">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="detail-image" />
            ) : (
              <span>{(product.category || product.name || "TC").slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="detail-copy">
            <div className="section-eyebrow">Product record</div>
            <h2 id="product-detail-title">{product.name}</h2>
            <p className="detail-description">{product.description}</p>

            <div className="detail-price">
              INR {Number(product.price || 0).toLocaleString("en-IN")}
            </div>

            <div className="detail-record">
              <div className="detail-record-heading">Authenticity record</div>
              <dl>
                <div>
                  <dt>Product ID</dt>
                  <dd>{productId}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{product.category || "General catalog"}</dd>
                </div>
                <div>
                  <dt>Product hash</dt>
                  <dd className="machine-value">{productHash}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{isOutOfStock ? "Out of stock" : `${product.stock} available`}</dd>
                </div>
              </dl>
            </div>

            <p className="detail-note">
              Seller identity and payment details are not included in the current catalog API response.
            </p>

            <button
              className="btn-primary detail-add"
              disabled={isOutOfStock}
              onClick={() => {
                onAddToCart(product.id);
                onClose();
              }}
            >
              {isOutOfStock ? "Unavailable" : "Add to secure cart"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
