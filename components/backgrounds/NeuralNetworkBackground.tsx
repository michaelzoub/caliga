"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export default function NeuralNetworkBackground({
  particleCount = 80,
  connectionDistance = 150,
  color = "#BC7C3C",
  opacity = 1,
}: {
  particleCount?: number;
  connectionDistance?: number;
  color?: string;
  opacity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cv = canvas!;
    const cx = ctx!;

    let rafId: number;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let time = 0;

    // Parse color to RGB
    const tempEl = document.createElement("div");
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    const rgbMatch = computedColor.match(/\d+/g);
    const r = rgbMatch ? parseInt(rgbMatch[0], 10) : 188;
    const g = rgbMatch ? parseInt(rgbMatch[1], 10) : 124;
    const b = rgbMatch ? parseInt(rgbMatch[2], 10) : 60;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.offsetWidth;
      h = cv.offsetHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      time += 0.016;
      cx.clearRect(0, 0, w, h);

      // Draw subtle gradient background
      const gradient = cx.createRadialGradient(
        w * 0.5,
        h * 0.4,
        0,
        w * 0.5,
        h * 0.4,
        Math.max(w, h) * 0.7
      );
      gradient.addColorStop(
        0,
        `rgba(${Math.floor(r * 0.08)}, ${Math.floor(g * 0.08)}, ${Math.floor(
          b * 0.08
        )}, ${opacity * 0.3})`
      );
      gradient.addColorStop(
        0.5,
        `rgba(${Math.floor(r * 0.03)}, ${Math.floor(g * 0.03)}, ${Math.floor(
          b * 0.03
        )}, ${opacity * 0.15})`
      );
      gradient.addColorStop(1, `rgba(10, 10, 10, 0)`);
      cx.fillStyle = gradient;
      cx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = ((200 - dist) / 200) * 0.5;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Gentle drift
        p.vx += Math.sin(time * 0.3 + p.pulseOffset) * 0.002;
        p.vy += Math.cos(time * 0.2 + p.pulseOffset) * 0.002;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw particle
        const pulse =
          Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.3 + 0.7;
        const alpha = p.alpha * pulse * opacity;

        cx.beginPath();
        cx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        cx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < connectionDistance) {
            const connAlpha =
              (1 - cdist / connectionDistance) * 0.15 * opacity;
            cx.beginPath();
            cx.moveTo(p.x, p.y);
            cx.lineTo(p2.x, p2.y);
            cx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${connAlpha})`;
            cx.lineWidth = 0.5;
            cx.stroke();
          }
        }
      }

      // Draw occasional data packet traveling along connections
      const packetTime = (time * 0.5) % 1;
      const sourceIdx =
        Math.floor(packetTime * particles.length) % particles.length;
      const targetIdx = (sourceIdx + 3) % particles.length;
      const sp = particles[sourceIdx];
      const tp = particles[targetIdx];

      if (sp && tp) {
        const progress = (packetTime * particles.length) % 1;
        const px = sp.x + (tp.x - sp.x) * progress;
        const py = sp.y + (tp.y - sp.y) * progress;
        cx.beginPath();
        cx.arc(px, py, 2, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * opacity})`;
        cx.fill();
        cx.beginPath();
        cx.arc(px, py, 6, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.1 * opacity})`;
        cx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const handleResize = () => resize();
    const handleMouseMove = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", handleResize);
    cv.addEventListener("mousemove", handleMouseMove);
    cv.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      cv.removeEventListener("mousemove", handleMouseMove);
      cv.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [particleCount, connectionDistance, color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "auto" }}
    />
  );
}
