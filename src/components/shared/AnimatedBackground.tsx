'use client';
import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface AnimatedBackgroundProps {
  density?: number;
  maxSpeed?: number;
  connectParticles?: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  density = 0.8,
  maxSpeed = 0.13,
  connectParticles = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number>(0);
  const mousePosition = useRef<{ x: number; y: number } | null>(null);

  const particleColors = [
    'rgba(139, 92, 246, 0.85)', // Violet-500, high opacity
    'rgba(59, 130, 246, 0.7)', // Blue-500
    'rgba(124, 58, 237, 0.7)', // Violet-600
    'rgba(255, 255, 255, 0.6)', // White for extra pop
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles.current = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / (9000 / density));
      for (let i = 0; i < particleCount; i++) {
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];
        particles.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.8,
          speedX: (Math.random() - 0.5) * maxSpeed,
          speedY: (Math.random() - 0.5) * maxSpeed,
          opacity: Math.random() * 0.4 + 0.5,
          color,
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseLeave = () => {
      mousePosition.current = null;
    };

    const connectNearbyParticles = (p1: Particle, p2: Particle) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = canvas.width * 0.09;
      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.22})`;
        ctx.lineWidth = 0.7;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < 0) particle.x = canvas.width;
        else if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        else if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.shadowColor = '#8B5CF6';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (connectParticles) {
          for (let i = index + 1; i < particles.current.length; i++) {
            connectNearbyParticles(particle, particles.current[i]);
          }
        }

        if (mousePosition.current) {
          const dx = particle.x - mousePosition.current.x;
          const dy = particle.y - mousePosition.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = canvas.width * 0.13;
          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.36})`;
            ctx.lineWidth = 0.9;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mousePosition.current.x, mousePosition.current.y);
            ctx.stroke();
            const force = 0.07 * opacity;
            particle.speedX += dx * force * 0.009;
            particle.speedY += dy * force * 0.009;
            const currentSpeed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
            if (currentSpeed > maxSpeed * 1.4) {
              const ratio = (maxSpeed * 1.4) / currentSpeed;
              particle.speedX *= ratio;
              particle.speedY *= ratio;
            }
          }
        }
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [density, maxSpeed, connectParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
};

export default AnimatedBackground;
