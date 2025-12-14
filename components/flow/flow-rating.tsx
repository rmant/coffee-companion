"use client";

interface FlowRatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
}

export function FlowRating({ value, onChange }: FlowRatingProps) {
  const handleClick = (rating: number) => {
    // Toggle off if clicking the same rating
    if (value === rating) {
      onChange(null);
    } else {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          onClick={() => handleClick(rating)}
          className="group transition-transform hover:scale-110 active:scale-95"
          aria-label={`${rating} de 5 estrellas`}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className={`transition-colors ${
              value !== null && rating <= value
                ? "text-[#d4a574]"
                : "text-white/20 group-hover:text-white/40"
            }`}
          >
            {/* Coffee bean shape */}
            <ellipse cx="24" cy="24" rx="12" ry="20" fill="currentColor" />
            <path
              d="M24 8c-2 4-2 12 0 16s2 12 0 16"
              stroke={value !== null && rating <= value ? "#3c2415" : "rgba(255,255,255,0.2)"}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
