"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useState } from "react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setVisible(latest > 0.02);
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-gradient-to-r from-primary to-violet-400 origin-left"
      style={{
        scaleX,
        transformOrigin: "0%",
      }}
      animate={{
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
    />
  );
}
