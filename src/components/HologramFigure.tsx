import React, { useEffect, useRef } from 'react';

interface HologramFigureProps {
  interactive?: boolean;
}

export const HologramFigure: React.FC<HologramFigureProps> = ({ interactive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 10;

      ctx.clearRect(0, 0, w, h);

      // Rotating energy rings at base
      ctx.save();
      ctx.translate(cx, h - 35);
      const ringScale = Math.sin(time) * 0.05 + 1;

      // Outer platform ring
      ctx.beginPath();
      ctx.ellipse(0, 0, 110 * ringScale, 28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.stroke();

      // Inner platform ring
      ctx.beginPath();
      ctx.ellipse(0, 0, 75 * ringScale, 18, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.stroke();

      // Glowing emitter center
      const emitterGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 45);
      emitterGrad.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
      emitterGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = emitterGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 50, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Mannequin skeleton joint locations in 3D-ish space
      const sway = Math.sin(time * 0.8) * 6;
      const breath = Math.sin(time * 1.5) * 3;

      // Define standard figure joint offsets
      const head = { x: cx + sway * 0.5, y: cy - 110 + breath };
      const neck = { x: cx + sway * 0.5, y: cy - 80 + breath };
      const lShoulder = { x: cx - 45 + sway * 0.4, y: cy - 70 + breath };
      const rShoulder = { x: cx + 45 + sway * 0.4, y: cy - 70 + breath };
      
      const armSwing = Math.sin(time) * 12;
      const lElbow = { x: cx - 65, y: cy - 25 + armSwing };
      const rElbow = { x: cx + 65, y: cy - 25 - armSwing };
      const lWrist = { x: cx - 55, y: cy + 18 + armSwing * 1.2 };
      const rWrist = { x: cx + 55, y: cy + 18 - armSwing * 1.2 };

      const lHip = { x: cx - 28 + sway * 0.2, y: cy + 10 };
      const rHip = { x: cx + 28 + sway * 0.2, y: cy + 10 };

      const lKnee = { x: cx - 35, y: cy + 75 };
      const rKnee = { x: cx + 35, y: cy + 75 };

      const lAnkle = { x: cx - 38, y: cy + 140 };
      const rAnkle = { x: cx + 38, y: cy + 140 };

      const bones: [{ x: number; y: number }, { x: number; y: number }][] = [
        [neck, head],
        [neck, lShoulder],
        [neck, rShoulder],
        [lShoulder, lElbow],
        [lElbow, lWrist],
        [rShoulder, rElbow],
        [rElbow, rWrist],
        [lShoulder, lHip],
        [rShoulder, rHip],
        [lHip, rHip],
        [lHip, lKnee],
        [lKnee, lAnkle],
        [rHip, rKnee],
        [rKnee, rAnkle],
      ];

      // Draw vertical scanner line sweeping through the avatar
      const scanY = (cy - 120) + ((Math.sin(time * 1.2) + 1) / 2) * 270;
      const scanGrad = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 12);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(cx - 90, scanY - 12, 180, 24);

      // Draw bones
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#06b6d4';

      bones.forEach(([p1, p2]) => {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw glowing joint spheres
      const joints = [
        head, neck, lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist,
        lHip, rHip, lKnee, rKnee, lAnkle, rAnkle
      ];

      joints.forEach((joint, idx) => {
        const isHead = idx === 0;
        const radius = isHead ? 14 : 4.5;
        
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isHead ? 'rgba(6, 182, 212, 0.2)' : '#ffffff';
        ctx.fill();

        ctx.strokeStyle = idx % 2 === 0 ? '#06b6d4' : '#c084fc';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Extra targeting reticle around head
        if (isHead) {
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, 22, time, time + Math.PI * 1.4);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      ctx.shadowBlur = 0;

      // Holographic readouts floating near torso
      ctx.font = '10px "Orbitron", monospace';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.fillText('MOVENET: SYNCED', cx + 70, cy - 60);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.8)';
      ctx.fillText('BIOMETRIC: OPTIMAL', cx + 70, cy - 45);

      // Subtle targeting lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rShoulder.x + 8, rShoulder.y);
      ctx.lineTo(cx + 65, cy - 63);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [interactive]);

  return (
    <div className="relative flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={340}
        height={380}
        className="w-[300px] h-[340px] md:w-[340px] md:h-[380px] drop-shadow-[0_0_20px_rgba(6,182,212,0.35)]"
      />
    </div>
  );
};
