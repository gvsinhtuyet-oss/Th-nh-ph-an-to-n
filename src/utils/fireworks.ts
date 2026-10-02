// Fullscreen Canvas Particle Fireworks Engine
export function launchCelebrationFireworks(durationMs: number = 4000): () => void {
  if (typeof window === 'undefined') return () => {};

  const canvas = document.createElement('canvas');
  canvas.id = 'tpat-fireworks-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    size: number;
    decay: number;
  }

  const particles: Particle[] = [];
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#eab308'];

  function createFirework(x: number, y: number) {
    const count = 45;
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
        color: Math.random() > 0.3 ? baseColor : colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        size: Math.random() * 3 + 2,
        decay: Math.random() * 0.015 + 0.015,
      });
    }
  }

  let animationFrameId: number;
  let isRunning = true;
  const startTime = Date.now();

  let nextLaunch = 0;

  function animate() {
    if (!ctx || !isRunning) return;

    ctx.clearRect(0, 0, width, height);

    const elapsed = Date.now() - startTime;
    if (elapsed < durationMs) {
      if (Date.now() > nextLaunch) {
        createFirework(
          Math.random() * (width * 0.7) + width * 0.15,
          Math.random() * (height * 0.4) + height * 0.15
        );
        nextLaunch = Date.now() + Math.random() * 300 + 200;
      }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.06; // gravity
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (elapsed < durationMs || particles.length > 0) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      cleanup();
    }
  }

  function cleanup() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', handleResize);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  animate();

  return cleanup;
}
