import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
  size: number;
}

export function ParticleBurst({ 
  x, y, color, count = 12, onComplete 
}: { 
  x: number; 
  y: number; 
  color: string; 
  count?: number;
  onComplete?: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: 0,
        y: 0,
        color: color,
        angle: Math.random() * Math.PI * 2,
        speed: 2 + Math.random() * 4,
        size: 3 + Math.random() * 4,
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => {
      onComplete?.();
    }, 600); // match animation duration

    return () => clearTimeout(timer);
  }, [count, color, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div 
      className="absolute pointer-events-none overflow-visible z-50"
      style={{ left: x, top: y, width: 0, height: 0 }}
    >
      <style>{`
        @keyframes particle-fade-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0); }
        }
      `}</style>
      {particles.map(p => {
        const tx = Math.cos(p.angle) * p.speed * 10;
        const ty = Math.sin(p.angle) * p.speed * 10;
        return (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              marginLeft: -p.size/2,
              marginTop: -p.size/2,
              transform: `translate(${tx}px, ${ty}px)`,
              transition: 'transform 0.6s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.6s ease-out',
              opacity: 0,
              boxShadow: `0 0 ${p.size*2}px ${p.color}`,
              animation: 'particle-fade-out 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards'
            }}
          />
        );
      })}
    </div>
  );
}
