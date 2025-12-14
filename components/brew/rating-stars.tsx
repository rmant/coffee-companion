"use client";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number | null;
  onChange?: (value: number | null) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RatingStars({
  value,
  onChange,
  readonly = false,
  size = "md",
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  function handleClick(star: number) {
    if (readonly || !onChange) return;
    // Clicking the same star again clears the rating
    onChange(value === star ? null : star);
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={readonly}
          className={cn(
            sizeClasses[size],
            "transition-colors focus:outline-none",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default",
            value !== null && star <= value
              ? "text-yellow-500"
              : "text-muted-foreground/30 hover:text-yellow-500/50"
          )}
        >
          ★
        </button>
      ))}
      {value && !readonly && (
        <button
          type="button"
          onClick={() => onChange?.(null)}
          className="ml-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}
