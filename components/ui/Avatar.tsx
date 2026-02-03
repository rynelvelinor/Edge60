"use client";

import { forwardRef, HTMLAttributes, useState } from "react";
import { cn, generateAvatarColor } from "../../lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  address?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, address, name, size = "md", ...props }, ref) => {
    const [imageError, setImageError] = useState(false);

    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-14 w-14 text-base",
      xl: "h-20 w-20 text-xl",
    };

    const initials = name
      ? name.slice(0, 2).toUpperCase()
      : address
        ? address.slice(2, 4).toUpperCase()
        : "??";

    const bgColor = address ? generateAvatarColor(address) : "#6366f1";

    if (src && !imageError) {
      return (
        <div
          ref={ref}
          className={cn(
            "relative rounded-full overflow-hidden flex-shrink-0",
            sizes[size],
            className
          )}
          {...props}
        >
          <img
            src={src}
            alt={name || address || "Avatar"}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-full flex items-center justify-center font-bold text-white flex-shrink-0",
          sizes[size],
          className
        )}
        style={{ backgroundColor: bgColor }}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
