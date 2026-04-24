import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
  pulsePhase: number;
  pulseSpeed: number;
  hue: number;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });
  const scrollRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.min(Math.floor((w * h) / 22000), 70);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.4 + 0.4,
        baseOpacity: Math.random() * 0.5 + 0.15,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.012 + 0.004,
        hue: Math.random() < 0.7 ? 185 : 280, // mostly cyan, accent magenta
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimRef.current = { w, h };
      initParticles(w, h);
    };

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const handleLeave = () => { mouseRef.current.active = false; };
    const handleScroll = () => { scrollRef.current = window.scrollY; };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    let time = 0;
    const CONNECT_DIST = 140;
    const MOUSE_DIST = 220;
    const GRID = 56;

    const draw = () => {
      time += 1;
      const { w, h } = dimRef.current;
      const mouse = mouseRef.current;
      ctx.clearRect(0, 0, w, h);

      // ---------- Aurora gradient layers ----------
      const aurora1 = ctx.createRadialGradient(
        w * 0.2 + Math.sin(time * 0.003) * 80,
        h * 0.15 + Math.cos(time * 0.002) * 60,
        0,
        w * 0.2, h * 0.15, w * 0.6
      );
      aurora1.addColorStop(0, "hsla(185, 85%, 55%, 0.10)");
      aurora1.addColorStop(1, "hsla(185, 85%, 55%, 0)");
      ctx.fillStyle = aurora1;
      ctx.fillRect(0, 0, w, h);

      const aurora2 = ctx.createRadialGradient(
        w * 0.85 + Math.cos(time * 0.0025) * 100,
        h * 0.85 + Math.sin(time * 0.0018) * 70,
        0,
        w * 0.85, h * 0.85, w * 0.55
      );
      aurora2.addColorStop(0, "hsla(280, 75%, 60%, 0.08)");
      aurora2.addColorStop(1, "hsla(280, 75%, 60%, 0)");
      ctx.fillStyle = aurora2;
      ctx.fillRect(0, 0, w, h);

      // ---------- Grid (perspective drift) ----------
      const drift = (time * 0.15) % GRID;
      ctx.strokeStyle = "hsla(222, 18%, 22%, 0.35)";
      ctx.lineWidth = 0.5;
      for (let x = -drift; x < w; x += GRID) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = -drift; y < h; y += GRID) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ---------- Grid intersections that light up near mouse ----------
      if (mouse.active) {
        const startX = Math.floor((mouse.x - MOUSE_DIST) / GRID) * GRID - drift;
        const endX = mouse.x + MOUSE_DIST;
        const startY = Math.floor((mouse.y - MOUSE_DIST) / GRID) * GRID - drift;
        const endY = mouse.y + MOUSE_DIST;
        for (let x = startX; x <= endX; x += GRID) {
          for (let y = startY; y <= endY; y += GRID) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_DIST) {
              const intensity = 1 - dist / MOUSE_DIST;
              ctx.fillStyle = `hsla(185, 90%, 65%, ${intensity * 0.35})`;
              ctx.beginPath();
              ctx.arc(x, y, 1.2 + intensity * 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      const particles = particlesRef.current;

      // ---------- Update particles ----------
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;

        // Mouse repulsion
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST && dist > 0.1) {
            const force = (1 - dist / MOUSE_DIST) * 0.6;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }
        }

        // Damping & cap
        p.vx *= 0.985;
        p.vy *= 0.985;
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > 1.5) { p.vx = (p.vx / sp) * 1.5; p.vy = (p.vy / sp) * 1.5; }
      }

      // ---------- Connections ----------
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            const hue = (a.hue + b.hue) / 2;
            ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // ---------- Particles ----------
      for (const p of particles) {
        const pulse = Math.sin(p.pulsePhase) * 0.35 + 0.75;
        const r = p.radius * pulse;
        const alpha = p.baseOpacity * pulse;

        // Glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
        glow.addColorStop(0, `hsla(${p.hue}, 85%, 65%, ${alpha * 0.45})`);
        glow.addColorStop(1, `hsla(${p.hue}, 85%, 65%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${Math.min(alpha + 0.3, 1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---------- Mouse spotlight ----------
      if (mouse.active) {
        const spot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        spot.addColorStop(0, "hsla(185, 90%, 65%, 0.06)");
        spot.addColorStop(0.5, "hsla(185, 90%, 65%, 0.02)");
        spot.addColorStop(1, "hsla(185, 90%, 65%, 0)");
        ctx.fillStyle = spot;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [initParticles]);

  return (
    <>
      {/* Static aurora ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-aurora opacity-60" />
      {/* Vignette */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.85) 100%)",
        }}
      />
      {/* Interactive canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.85 }} />
    </>
  );
}
