"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface MeteorsProps {
  className?: string;
  children?: React.ReactNode;
  /** Number of meteors */
  count?: number;
  /** Backward-compatible alias for count */
  number?: number;
  /** Meteor angle in degrees (215 = diagonal down-left) */
  angle?: number;
  /** Meteor color */
  color?: string;
  /** Tail gradient color */
  tailColor?: string;
}

interface MeteorData {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

export function Meteors({
  className,
  children,
  count = 10,
  number,
  angle = 215,
  color = "currentColor",
  tailColor = "currentColor",
}: MeteorsProps) {
  const [meteors, setMeteors] = useState<MeteorData[]>([]);
  const meteorCount = number ?? count;

  // Generate meteor data on client only to avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeteors(
      Array.from({ length: meteorCount }, (_, i) => ({
        id: i,
        left: i * (100 / meteorCount), // Evenly distribute across width
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 7,
      })),
    );
  }, [meteorCount]);

  return (
    <div
      className={cn(
        "text-primary/70 dark:text-primary/85 fixed inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Keyframe animation - uses vmax for viewport scaling */}
      <style>{`
        @keyframes meteor-fall {
          0% {
            transform: rotate(${angle}deg) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(${angle}deg) translateX(-100vmax);
            opacity: 0;
          }
        }
      `}</style>

      {/* Meteors */}
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className="absolute h-1 w-1 rounded-full"
          style={{
            top: "-40px",
            left: `${meteor.left}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
            animation: `meteor-fall ${meteor.duration}s linear infinite`,
            animationDelay: `${meteor.delay}s`,
          }}
        >
          {/* Tail */}
          <span
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: "100%",
              width: "72px",
              height: "2px",
              background: `linear-gradient(to right, ${tailColor}, transparent)`,
            }}
          />
        </span>
      ))}

      {/* Content layer */}
      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}

export default function MeteorsDemo() {
  return <Meteors />;
}
