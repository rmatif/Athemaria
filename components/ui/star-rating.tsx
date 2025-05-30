"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  currentRating: number;
  totalStars?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  size?: string;
}

export function StarRating({
  currentRating,
  totalStars = 5,
  onRate,
  readOnly = true,
  size = "h-5 w-5",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const stars = Array.from({ length: totalStars }, (_, i) => i + 1);

  return (
    <div className="flex items-center">
      {stars.map((starValue) => {
        const userInteracting = hoverRating !== null || (onRate !== undefined && !readOnly); // DECLARED FIRST
        const displayRating = hoverRating ?? (readOnly ? currentRating : (userInteracting ? 0 : currentRating) ); // USED AFTER
        
        const isFilled = displayRating >= starValue;

        return (
          <Star
            key={starValue}
            className={cn(
              size, // Assuming 'size' is a prop
              isFilled ? "text-yellow-400" : "text-gray-300",
              !readOnly && "cursor-pointer hover:text-yellow-300"
            )}
            fill={isFilled ? "currentColor" : "none"}
            onClick={() => !readOnly && onRate?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(null)}
          />
        );
      })}
    </div>
  );
}
