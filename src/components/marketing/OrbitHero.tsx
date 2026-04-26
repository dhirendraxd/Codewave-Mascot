import {
  Mic,
  MapPin,
  MessageSquare,
  Sparkles,
  Boxes,
  Hash,
  Calendar,
  Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Minimalist hero orbit — small icon bubbles rotating on concentric rings
 * around a central pulsing mic. No data cards, just clean iconography.
 */

interface OrbitItem {
  angle: number; // degrees on the ring
  icon: LucideIcon;
  /** Distinct hue per icon — independent from the page background gradient */
  color?: string;
}

interface Ring {
  radius: number;
  spinClass: string;
  items: OrbitItem[];
}

function IconBubble({
  icon: Icon,
  color,
}: {
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-full ring-1 backdrop-blur-md"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 14%, var(--color-card) 86%)`,
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
        boxShadow: `0 8px 28px -10px color-mix(in oklab, ${color} 55%, transparent)`,
        // ring-1 uses --tw-ring-color via boxShadow trick; rely on border via bg color-mix instead
      }}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

// Distinct, saturated hues per icon — independent palette from the warm page gradient
const ICON_TEAL = "oklch(0.78 0.12 195)";
const ICON_SKY = "oklch(0.78 0.12 230)";
const ICON_VIOLET = "oklch(0.74 0.14 295)";
const ICON_LIME = "oklch(0.84 0.14 130)";
const ICON_ROSE = "oklch(0.74 0.16 10)";
const ICON_YELLOW = "oklch(0.86 0.13 95)";
const ICON_CYAN = "oklch(0.82 0.11 210)";

const rings: Ring[] = [
  {
    radius: 120,
    spinClass: "animate-orbit-fast",
    items: [
      { angle: 30, icon: Hash, color: ICON_TEAL },
      { angle: 210, icon: MapPin, color: ICON_LIME },
    ],
  },
  {
    radius: 190,
    spinClass: "animate-orbit-mid",
    items: [
      { angle: 80, icon: Boxes, color: ICON_VIOLET },
      { angle: 200, icon: MessageSquare, color: ICON_SKY },
      { angle: 320, icon: Calendar, color: ICON_YELLOW },
    ],
  },
  {
    radius: 260,
    spinClass: "animate-orbit-slow",
    items: [
      { angle: 150, icon: Sparkles, color: ICON_ROSE },
      { angle: 340, icon: Brain, color: ICON_CYAN },
    ],
  },
];

export function OrbitHero() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      {/* Soft glow behind */}
      <div className="absolute left-1/2 top-1/2 h-[60%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--ember-glow)_0%,transparent_60%)] opacity-15 blur-2xl" />

      {/* Rings */}
      {rings.map((r, i) => (
        <div
          key={`ring-${i}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60"
          style={{ width: r.radius * 2, height: r.radius * 2 }}
        />
      ))}

      {/* Center illustration mic (minimal line style) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-primary/15" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-border/70 bg-card/70">
            <Mic className="h-14 w-14 text-primary" strokeWidth={1.75} />
          </div>
          <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Speak freely
          </p>
        </div>
      </div>

      {/* Spinning groups: counter-rotate the inner content so it stays upright */}
      {rings.map((r, i) => (
        <div
          key={`spin-${i}`}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${r.spinClass}`}
          style={{ width: r.radius * 2, height: r.radius * 2 }}
        >
          {r.items.map((item, j) => {
            const rad = (item.angle * Math.PI) / 180;
            const x = Math.cos(rad) * r.radius;
            const y = Math.sin(rad) * r.radius;
            return (
              <div
                key={j}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                }}
              >
                <div
                  className={`${r.spinClass} animate-float`}
                  style={{
                    animationDirection: "reverse",
                    animationDelay: `${j * 0.3}s`,
                  }}
                >
                  <IconBubble
                    icon={item.icon}
                    color={item.color ?? "var(--color-primary)"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
