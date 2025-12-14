"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

const colors = [
  "#d4a574", // gold
  "#faf6f0", // cream
  "#c45c3e", // terracotta
  "#c9a66b", // amber
  "#b8956b", // bronze
];

export function FlowParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on mount
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1000,
      duration: 2000 + Math.random() * 2000,
      size: 8 + Math.random() * 8,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="flow-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="flow-particle"
          style={{
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
