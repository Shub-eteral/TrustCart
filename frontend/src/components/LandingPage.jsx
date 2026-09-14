import { useEffect, useRef, useState, useCallback } from "react";
import "./LandingPage.css";

const particleShader = `
  precision mediump float;
  attribute vec2 aPosition;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aSpeed;
  attribute float aDelay;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 pos = aPosition;
    float t = uTime * aSpeed - aDelay;
    pos.y += sin(t + pos.x * 10.0) * 0.02;
    pos.x += cos(t * 0.7 + pos.y * 8.0) * 0.015;
    float dist = distance(pos * uResolution, uMouse);
    float influence = smoothstep(0.3, 0.0, dist) * 0.15;
    pos += normalize(pos * uResolution - uMouse) * influence;
    vec2 clipPos = pos * 2.0 - 1.0;
    clipPos.y *= -1.0;
    gl_Position = vec4(clipPos, 0.0, 1.0);
    gl_PointSize = aSize * (1.0 + influence * 3.0) * uResolution.y * 0.01;
    vColor = aColor;
    vAlpha = 0.6 + 0.4 * sin(t * 2.0);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function Glossy3DObject({ className = "", isVisible = true }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(() => Date.now());
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particleCount = 800;

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    glRef.current = gl;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const createProgram = (vs, fs) => {
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    };

    const vs = createShader(gl.VERTEX_SHADER, particleShader);
    const fs = createShader(gl.FRAGMENT_SHADER, fragmentShader);
    const program = createProgram(vs, fs);
    if (!program) return;

    gl.useProgram(program);

    const positions = new Float32Array(particleCount * 2);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const delays = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 2] = Math.random();
      positions[i * 2 + 1] = Math.random();
      sizes[i] = 1.5 + Math.random() * 2.5;
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.4;
        colors[i * 3 + 2] = 0.2 + Math.random() * 0.3;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.2;
      } else {
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.4 + Math.random() * 0.3;
        colors[i * 3 + 2] = 1.0;
      }
      speeds[i] = 0.3 + Math.random() * 0.7;
      delays[i] = Math.random() * 10.0;
    }

    const createBuffer = (data, size, name) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return buffer;
    };

    createBuffer(positions, 2, "aPosition");
    createBuffer(sizes, 1, "aSize");
    createBuffer(colors, 3, "aColor");
    createBuffer(speeds, 1, "aSpeed");
    createBuffer(delays, 1, "aDelay");

    const uTime = gl.getUniformLocation(program, "uTime");
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uMouse = gl.getUniformLocation(program, "uMouse");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    const render = (time) => {
      if (!isVisible) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const startTime = typeof startTimeRef.current === 'function' ? startTimeRef.current() : startTimeRef.current;
      const elapsed = (time - startTime) * 0.001;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mouseRef.current.x * canvas.width, mouseRef.current.y * canvas.height);
      gl.drawArrays(gl.POINTS, 0, particleCount);
      animationRef.current = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    resize();

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    });

    canvas.addEventListener("touchmove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = (touch.clientX - rect.left) / rect.width;
      mouseRef.current.y = (touch.clientY - rect.top) / rect.height;
    }, { passive: true });

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
    };
  }, [isVisible, particleCount]);

  useEffect(() => {
    const cleanup = initGL();
    return cleanup;
  }, [initGL]);

  return (
    <canvas
      ref={canvasRef}
      className={`glossy-canvas ${className}`}
      aria-hidden="true"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

function FloatingOrbit({ radius = 200, speed = 20, direction = 1, color = "rgba(255,104,74,0.3)", children }) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let start = Date.now();
    const animate = (now) => {
      const elapsed = (now - start) * 0.001;
      setAngle((elapsed * 360 / speed * direction) % 360);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [speed, direction]);

  return (
    <div
      className="floating-orbit"
      style={{
        "--radius": `${radius}px`,
        "--angle": `${angle}deg`,
        "--color": color,
      }}
    >
      {children}
    </div>
  );
}

function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallax = scrollY * 0.3;
  const opacity = Math.max(0, 1 - scrollY / 600);

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-bg" style={{ transform: `translateY(${parallax}px)` }} />
      
      <div className="hero-particles" style={{ opacity }}>
        <Glossy3DObject isVisible={opacity > 0.1} />
      </div>

      <div className="hero-content">
        <div className="hero-text" style={{ opacity, transform: `translateY(${scrollY * 0.15}px)` }}>
          <span className="hero-kicker">PREMIUM COMMERCE</span>
          <h1 className="hero-title">
            TrustCart
            <span className="hero-accent">.</span>
          </h1>
          <p className="hero-description">
            Experience the future of secure shopping with blockchain-verified
            transactions, transparent supply chains, and premium service.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary">
              <span>Start Shopping</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span>Watch Demo</span>
            </button>
          </div>
          <div className="hero-trust">
            <div className="trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Blockchain Verified</span>
            </div>
            <div className="trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12V7H5" />
                <path d="M16 7l-4-4-4 4" />
                <path d="M12 17v5" />
                <path d="M9 17h6" />
              </svg>
              <span>Fast Delivery</span>
            </div>
            <div className="trust-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M16 10h-12" />
                <path d="M12 10v10" />
              </svg>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" style={{ transform: `translateY(${scrollY * 0.05}px) rotate(${scrollY * 0.02}deg)` }}>
          <div className="hero-3d-container">
            <FloatingOrbit radius={280} speed={35} direction={1} color="rgba(255,104,74,0.25)">
              <FloatingOrbit radius={140} speed={22} direction={-1} color="rgba(216,243,107,0.25)">
                <div className="hero-3d-object">
                  <div className="object-face front">
                    <div className="object-gloss" />
                    <div className="object-mark">TC</div>
                    <div className="object-seal">✓</div>
                  </div>
                  <div className="object-face back">
                    <div className="object-gloss" />
                  </div>
                  <div className="object-face right" />
                  <div className="object-face left" />
                  <div className="object-face top" />
                  <div className="object-face bottom" />
                </div>
              </FloatingOrbit>
            </FloatingOrbit>

            <FloatingOrbit radius={180} speed={45} direction={-1} color="rgba(192,132,252,0.18)">
              <div className="orbit-ring" />
            </FloatingOrbit>

            <FloatingOrbit radius={340} speed={55} direction={1} color="rgba(255,104,74,0.15)">
              <div className="orbit-ring" style={{ borderColor: "rgba(255,104,74,0.2)" }} />
            </FloatingOrbit>

            <div className="hero-shadow" style={{ opacity: 0.3 - scrollY * 0.0003 }} />
          </div>
        </div>
      </div>

      <div className="scroll-indicator" style={{ opacity }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12V7H5" />
          <path d="M16 7l-4-4-4 4" />
          <path d="M12 17v5" />
          <path d="M9 17h6" />
        </svg>
      ),
      title: "Lightning Delivery",
      description: "Same-day delivery in metro areas. Real-time tracking with blockchain timestamps.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M16 10h-12" />
          <path d="M12 10v10" />
        </svg>
      ),
      title: "Bank-Grade Security",
      description: "End-to-end encryption, biometric authentication, and zero-knowledge proofs.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Blockchain Trust",
      description: "Every transaction immutably recorded. Verify authenticity instantly.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: "24/7 Concierge",
      description: "Dedicated support agents. Average response time under 90 seconds.",
    },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">WHY TRUSTCART</span>
          <h2 className="section-title">Built for <span className="text-accent">Confidence</span></h2>
          <p className="section-description">
            Every feature designed to make your shopping experience seamless, secure, and transparent.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="feature-card"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "2.5M+", label: "Orders Processed" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "4.9★", label: "Average Rating" },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={stat.label} className="stat-card" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductShowcaseSection() {
  const products = [
    {
      id: 1,
      name: "Alphonso Mangoes",
      category: "Groceries",
      price: 349,
      rating: 4.9,
      image: "🥭",
      gradient: "radial-gradient(circle at 30% 30%, #f6d785, #c6d7ac 48%, #8ea27e)",
    },
    {
      id: 2,
      name: "Roasted Arabica Coffee",
      category: "Groceries",
      price: 599,
      rating: 4.8,
      image: "☕",
      gradient: "radial-gradient(circle at 30% 30%, #8b5a2b, #5d3a1a 55%, #2e1a0d)",
    },
    {
      id: 3,
      name: "Italian Bronze Pasta",
      category: "Groceries",
      price: 189,
      rating: 4.7,
      image: "🍝",
      gradient: "radial-gradient(circle at 30% 30%, #f5e6c8, #d4b88c 50%, #b8956a)",
    },
    {
      id: 4,
      name: "Wildflower Honey",
      category: "Groceries",
      price: 425,
      rating: 4.9,
      image: "🍯",
      gradient: "radial-gradient(circle at 30% 30%, #fdd835, #fbc02d 50%, #f9a825)",
    },
  ];

  return (
    <section className="showcase-section">
      <div className="container">
        <div className="section-header">
          <span className="section-kicker">FEATURED</span>
          <h2 className="section-title">Curated <span className="text-accent">Selection</span></h2>
          <p className="section-description">
            Hand-picked premium products with verified authenticity and quality guarantees.
          </p>
        </div>

        <div className="showcase-grid">
          {products.map((product, index) => (
            <article
              key={product.id}
              className="showcase-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className="showcase-image"
                style={{ background: product.gradient }}
              >
                <span className="showcase-emoji">{product.image}</span>
                <div className="showcase-gloss" />
                <button className="wishlist-btn" aria-label="Add to wishlist">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <div className="showcase-badge">Verified</div>
              </div>
              <div className="showcase-content">
                <span className="showcase-category">{product.category}</span>
                <h3 className="showcase-title">{product.name}</h3>
                <div className="showcase-meta">
                  <div className="showcase-rating">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffd700" stroke="#ffd700" strokeWidth="1">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{product.rating}</span>
                  </div>
                  <div className="showcase-price">₹{product.price.toLocaleString("en-IN")}</div>
                </div>
                <button className="btn btn-outline showcase-btn">
                  Add to Cart
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="showcase-cta">
          <button className="btn btn-secondary btn-large">
            View All Products
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-bg">
        <Glossy3DObject className="cta-canvas" />
        <div className="cta-gradient" />
      </div>
      <div className="container cta-content">
        <h2 className="cta-title">Ready to Experience <span className="text-accent">Premium Commerce?</span></h2>
        <p className="cta-description">
          Join 50,000+ customers who trust TrustCart for secure, transparent, and delightful shopping.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-primary btn-large">
            Create Free Account
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-large">
            Contact Sales
          </button>
        </div>
        <div className="cta-trust">
          <span>No credit card required • 14-day free trial • Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Integrations", "API Docs", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press", "Contact"],
    Resources: ["Help Center", "Community", "Security", "Privacy", "Terms"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">Trust<span>Cart</span></div>
            <p className="footer-tagline">
              Secure shopping. Transparent orders. Trusted commerce.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
              </a>
              <a href="#" aria-label="GitHub" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="footer-column">
                <h4 className="footer-heading">{category}</h4>
                <ul>
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="footer-link">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 TrustCart. All rights reserved.</p>
          <div className="footer-badges">
            <span className="badge">SOC 2 Certified</span>
            <span className="badge">GDPR Compliant</span>
            <span className="badge">Blockchain Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function IntersectionObserver({ children, threshold = 0.1, rootMargin = "0px", className = "" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {children({ isVisible })}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav" role="navigation" aria-label="Main navigation">
        <div className="container nav-content">
          <a href="#" className="nav-logo" aria-label="TrustCart Home">
            Trust<span>Cart</span>
          </a>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#showcase" className="nav-link">Products</a>
            <a href="#stats" className="nav-link">Stats</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost">Sign In</button>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />

        <IntersectionObserver threshold={0.15} rootMargin="0px 0px -50px 0px">
          {({ isVisible }) => (
            <FeaturesSection id="features" className={isVisible ? "animate-in" : ""} />
          )}
        </IntersectionObserver>

        <IntersectionObserver threshold={0.1} rootMargin="0px 0px -50px 0px">
          {({ isVisible }) => (
            <StatsSection id="stats" className={isVisible ? "animate-in" : ""} />
          )}
        </IntersectionObserver>

        <IntersectionObserver threshold={0.15} rootMargin="0px 0px -50px 0px">
          {({ isVisible }) => (
            <ProductShowcaseSection id="showcase" className={isVisible ? "animate-in" : ""} />
          )}
        </IntersectionObserver>

        <IntersectionObserver threshold={0.1} rootMargin="0px 0px -50px 0px">
          {({ isVisible }) => (
            <CTASection className={isVisible ? "animate-in" : ""} />
          )}
        </IntersectionObserver>
      </main>

      <Footer />
    </div>
  );
}