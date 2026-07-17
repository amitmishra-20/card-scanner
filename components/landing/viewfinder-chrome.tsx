"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function ViewfinderChrome() {
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Time and fake ISO updates
  const [time, setTime] = useState("");
  const [iso, setIso] = useState(400);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")} REC`
      );
      if (Math.random() > 0.8) {
        setIso(Math.floor(Math.random() * (800 - 100) + 100));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    // Check if hovering an AR target or interactive element
    const target = e.target as HTMLElement;
    const isInteractive = !!target.closest("a, button, .ar-target, input");
    setIsHoveringTarget(isInteractive);
  }, [mouseX, mouseY]);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isShutterTrigger = !!target.closest("a[href^='/register'], .shutter-trigger");
    
    if (isShutterTrigger) {
      setIsFlashing(true);
      // Optional: Add shutter sound here
      setTimeout(() => setIsFlashing(false), 200);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick, true);
    
    // Add viewfinder-mode class to body
    document.body.classList.add("viewfinder-mode");

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, true);
      document.body.classList.remove("viewfinder-mode");
    };
  }, [handleMouseMove, handleClick]);

  return (
    <>
      {/* HUD Overlay - persistent corners and readouts */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-difference overflow-hidden">
        {/* Top Left */}
        <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-primary/70" />
        {/* Top Right */}
        <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-primary/70" />
        {/* Bottom Left */}
        <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-primary/70" />
        {/* Bottom Right */}
        <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-primary/70" />
        
        {/* Center Crosshair (subtle) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-primary/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-primary/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-px bg-primary/20" />

        {/* Top Data Bar */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[10px] font-mono text-primary/80 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            {time}
          </div>
          <div>F/2.8</div>
          <div>ISO {iso}</div>
          <div>4K 60FPS</div>
        </div>

        {/* Bottom Data Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 items-end">
          <div className="w-1 h-3 bg-primary/80" />
          <div className="w-1 h-4 bg-primary/80" />
          <div className="w-1 h-5 bg-primary/80" />
          <div className="w-1 h-3 bg-primary/40" />
          <div className="w-1 h-2 bg-primary/40" />
        </div>
      </div>

      {/* Shutter Flash */}
      <motion.div
        className="fixed inset-0 bg-white z-[100] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isFlashing ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      />

      {/* Custom Crosshair Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 text-primary mix-blend-difference"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%"
        }}
      >
        <motion.div
          animate={{
            scale: isHoveringTarget ? 1.5 : 1,
            rotate: isHoveringTarget ? 45 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative w-8 h-8 flex items-center justify-center"
        >
          {/* Central dot */}
          <div className="w-1 h-1 bg-primary rounded-full" />
          {/* Brackets */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />
        </motion.div>
      </motion.div>
    </>
  );
}
