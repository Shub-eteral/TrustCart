export default function AuthModal({
  isOpen,
  onClose,
  token,
  userEmail,
  userRole,
  isRegister,
  setIsRegister,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  loginLoading,
  onLogin,
  onRegister,
  onLogout,
  onViewOrders,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="auth-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {token ? (
          <div className="auth-user-wrap">
            <div className="user-avatar">👤</div>
            <h2>{userEmail}</h2>
            <p>
              Role:{" "}
              <strong style={{ color: "var(--blue-lt)" }}>{userRole}</strong>
              <br />
              Authenticated with JSON Web Token
            </p>

            <button
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                marginBottom: "10px",
              }}
              onClick={() => {
                onClose();
                onViewOrders();
              }}
            >
              View My Orders
            </button>

            <button className="logout-btn" onClick={onLogout}>
              Log Out
            </button>
          </div>
        ) : (
          <>
            <div className="auth-icon-wrap">
              {isRegister ? "📝" : "🔐"}
            </div>
            <h2 className="auth-title">
              {isRegister ? "Create Wallet Account" : "Access Your Account"}
            </h2>
            <p className="auth-sub">
              {isRegister
                ? "Register your credentials to purchase and verify goods."
                : "Sign in with your email and password."}
            </p>

            <form
              className="auth-form"
              onSubmit={isRegister ? onRegister : onLogin}
            >
              {isRegister && (
                <div>
                  <label className="form-lbl">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="form-lbl">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="user@trustcart.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-lbl">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="auth-submit"
                type="submit"
                disabled={loginLoading}
              >
                {loginLoading
                  ? "Authenticating..."
                  : isRegister
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>

            <div className="auth-toggle">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account yet?"}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
              >
                {isRegister ? "Sign In" : "Register"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
