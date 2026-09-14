import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

export default function MagneticButton({ children, className = "", onClick, type = "button" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 280, damping: 18, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 280, damping: 18, mass: 0.35 });

  const handleMove = (event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.2);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.2);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button ref={ref} type={type} style={{ x: springX, y: springY }} onMouseMove={handleMove} onMouseLeave={reset} onClick={onClick} className={className} whileTap={{ scale: 0.96 }}>
      {children}
    </motion.button>
  );
}
