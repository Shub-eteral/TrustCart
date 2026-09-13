/**
 * TrustCartLogo Component
 *
 * Visual Reference:
 * - Deep emerald shield (#087F5B)
 * - Gold cart symbol (#B8944D)
 * - Integrated padlock with shackle (#B8944D)
 * - Thin gold border (#B8944D)
 * - "Trust" in deep navy or white (theme-adaptive) + "Cart" in emerald (#087F5B)
 *
 * Supported variants: 'full' | 'compact' | 'icon' | 'footer'
 */

export function TrustCartEmblem({ size = 38, className = "" }) {
  return (
    <svg
      width={size}
      height={(size * 44) / 38}
      viewBox="0 0 38 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`trustcart-emblem ${className}`}
      aria-hidden="true"
    >
      {/* Outer shield rim with gold border */}
      <path
        d="M19 2 L35 7.5 V21 C35 31.5 19 41.5 19 41.5 C19 41.5 3 31.5 3 21 V7.5 Z"
        fill="#087F5B"
        stroke="#B8944D"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* Inner subtle engraved security contour */}
      <path
        d="M19 4.5 L32.5 9 V20.5 C32.5 29.5 19 38.5 19 38.5 C19 38.5 5.5 29.5 5.5 20.5 V9 Z"
        fill="#056047"
        opacity="0.55"
      />

      {/* Padlock Shackle */}
      <path
        d="M15.5 15.5 V12.5 C15.5 10.5 17 9 19 9 C21 9 22.5 10.5 22.5 12.5 V15.5"
        stroke="#F1E8D3"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Integrated Cart Basket */}
      <path
        d="M11 20 H27 L24.5 28.5 H13.5 Z"
        fill="none"
        stroke="#B8944D"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Padlock Body centered within the cart shield */}
      <rect
        x="16"
        y="15"
        width="6"
        height="5.5"
        rx="1"
        fill="#B8944D"
        stroke="#F1E8D3"
        strokeWidth="0.75"
      />
      {/* Keyhole */}
      <circle cx="19" cy="17.2" r="0.8" fill="#0B1F33" />
      <path d="M19 18 V19.2" stroke="#0B1F33" strokeWidth="0.8" strokeLinecap="round" />

      {/* Cart Wheels */}
      <circle cx="15" cy="31.5" r="1.6" fill="#B8944D" />
      <circle cx="23" cy="31.5" r="1.6" fill="#B8944D" />
    </svg>
  );
}

export default function TrustCartLogo({
  variant = "compact", // 'full' | 'compact' | 'icon' | 'footer'
  onClick,
  dark = true, // dark background context (e.g. vault navy navbar/footer)
  className = "",
}) {
  const isClickable = typeof onClick === "function";

  const content = (
    <span className={`trustcart-logo-inner variant-${variant} ${dark ? "theme-dark" : "theme-light"}`}>
      <TrustCartEmblem
        size={variant === "icon" ? 42 : variant === "full" ? 40 : 34}
      />

      {variant !== "icon" && (
        <span className="trustcart-wordmark-wrap">
          <span className="trustcart-wordmark">
            <span className="word-trust">Trust</span>
            <span className="word-cart">Cart</span>
            <span className="word-mark">®</span>
          </span>

          {variant === "full" && (
            <span className="trustcart-tagline-sub">
              AUTHENTICATED COMMERCE PROTOCOL
            </span>
          )}

          {variant === "compact" && (
            <span className="trustcart-verified-badge">
              <span className="tv-dot" />
              CRYPTOGRAPHIC LEDGER
            </span>
          )}

          {variant === "footer" && (
            <span className="trustcart-tagline-sub">
              SECURE COMMERCE FOR A SAFER WEB
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        className={`trustcart-logo-btn ${className}`}
        onClick={onClick}
        aria-label="TrustCart — Home"
        title="TrustCart — Return to Home"
      >
        {content}
      </button>
    );
  }

  return <div className={`trustcart-logo-static ${className}`}>{content}</div>;
}
