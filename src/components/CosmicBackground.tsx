import React, { useEffect, useRef } from 'react';

export const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      alpha: number;
      pulseSpeed: number;
    }

    const starColors = ['#ffffff', '#a5f3fc', '#c084fc', '#67e8f9', '#fde047'];
    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      const count = Math.min(Math.floor((width * height) / 3500), 220);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: (Math.random() - 0.5) * width * 1.5,
          y: (Math.random() - 0.5) * height * 1.5,
          z: Math.random() * width,
          size: Math.random() * 1.8 + 0.6,
          color: starColors[Math.floor(Math.random() * starColors.length)],
          alpha: Math.random() * 0.7 + 0.3,
          pulseSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    };

    initStars();

    let angle = 0;

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Deep space nebula glow
      const cx = width / 2;
      const cy = height / 2;

      // Cyan nebula patch
      const radGrad1 = ctx.createRadialGradient(cx * 0.4, cy * 0.3, 20, cx * 0.4, cy * 0.3, width * 0.5);
      radGrad1.addColorStop(0, 'rgba(6, 182, 212, 0.07)');
      radGrad1.addColorStop(0.6, 'rgba(14, 116, 144, 0.02)');
      radGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad1;
      ctx.fillRect(0, 0, width, height);

      // Purple nebula patch
      const radGrad2 = ctx.createRadialGradient(cx * 1.6, cy * 0.8, 30, cx * 1.6, cy * 0.8, width * 0.55);
      radGrad2.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
      radGrad2.addColorStop(0.5, 'rgba(126, 34, 206, 0.02)');
      radGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad2;
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial planet ring in top corner
      ctx.save();
      ctx.translate(width * 0.88, height * 0.15);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 90, 24, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.stroke();
      ctx.restore();

      // Render stars
      angle += 0.01;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.z -= 0.6;
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 1.5;
          star.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 250 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const pulsate = Math.sin(angle * 2 + i) * 0.3 + 0.7;
          const currentAlpha = star.alpha * pulsate;
          const starSize = star.size * Math.max(0.5, (1 - star.z / width) * 2.2);

          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.arc(px, py, starSize, 0, Math.PI * 2);
          ctx.fill();

          // Subtle glow on larger stars
          if (starSize > 2.0) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = star.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      <div className="absolute inset-0 hologram-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
    </div>
  );
};
