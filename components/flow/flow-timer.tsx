"use client";

interface FlowTimerProps {
  elapsed: number;
  target?: number;
  size?: number;
  showProgress?: boolean;
  className?: string;
}

export function FlowTimer({
  elapsed,
  target,
  size = 280,
  showProgress = true,
  className = "",
}: FlowTimerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // SVG calculations
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress (0 to 1)
  const progress = target && target > 0 ? Math.min(elapsed / target, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* SVG Timer Circle */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="flow-timer-circle flow-timer-glow"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="flow-timer-track"
        />

        {/* Progress */}
        {showProgress && target && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="flow-timer-progress"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        )}
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="flow-mono flow-text-timer text-[var(--flow-text-primary)]">
          {formatTime(elapsed)}
        </span>
        {target && (
          <span className="flow-mono text-lg text-[var(--flow-text-secondary)] mt-1">
            / {formatTime(target)}
          </span>
        )}
      </div>
    </div>
  );
}
