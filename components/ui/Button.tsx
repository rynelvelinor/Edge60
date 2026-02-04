"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-semibold",
      "rounded-lg transition-all duration-150",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none",
      "select-none cursor-pointer",
    );

    const variants = {
      // Primary: Antique Brass - 3D button effect
      primary: cn(
        "bg-[#c9a959] text-[#2d2a26]",
        "border-2 border-[#8a7025]",
        "shadow-[0_4px_0_#a88734,_3px_3px_8px_rgba(0,0,0,0.25)]",
        // Subtle top highlight
        "relative",
        "before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-[rgba(255,255,255,0.25)] before:rounded-t-lg",
        // Hover & Active states
        "hover:bg-[#d4b66a] hover:shadow-[0_4px_0_#a88734,_4px_4px_12px_rgba(0,0,0,0.3)]",
        "active:translate-y-[3px] active:shadow-[0_1px_0_#a88734,_1px_1px_4px_rgba(0,0,0,0.2)]",
        "focus-visible:ring-[#c9a959]",
      ),

      // Secondary: Cream card with wood border
      secondary: cn(
        "bg-[#f7f3eb] text-[#4a3023]",
        "border-2 border-[#c9bda8]",
        "shadow-[2px_2px_6px_rgba(0,0,0,0.12)]",
        "hover:bg-[#fffef8] hover:border-[#b5a896] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.15)]",
        "active:bg-[#f0ebe0] active:translate-y-[1px] active:shadow-[1px_1px_4px_rgba(0,0,0,0.1)]",
        "focus-visible:ring-[#c9bda8]",
      ),

      // Ghost: Minimal, just text
      ghost: cn(
        "text-[#6b5e4f]",
        "hover:bg-[rgba(201,169,89,0.1)] hover:text-[#4a3023]",
        "active:bg-[rgba(201,169,89,0.2)]",
        "focus-visible:ring-[#c9a959]",
      ),

      // Dark: Mahogany wood tone
      dark: cn(
        "bg-[#4a3023] text-[#f7f3eb]",
        "border-2 border-[#2a1a13]",
        "shadow-[0_3px_0_#2a1a13,_3px_3px_8px_rgba(0,0,0,0.3)]",
        "hover:bg-[#5a3a2a]",
        "active:translate-y-[2px] active:shadow-[0_1px_0_#2a1a13,_1px_1px_4px_rgba(0,0,0,0.2)]",
        "focus-visible:ring-[#4a3023]",
      ),

      // Danger: Muted brick red
      danger: cn(
        "bg-[#f5e8e8] text-[#a34a4a]",
        "border-2 border-[#d4a0a0]",
        "shadow-[2px_2px_6px_rgba(0,0,0,0.1)]",
        "hover:bg-[#f8ecec] hover:border-[#c48a8a]",
        "active:bg-[#f0e0e0] active:translate-y-[1px]",
        "focus-visible:ring-[#a34a4a]",
      ),
    };

    const sizes = {
      sm: "h-9 px-4 text-sm gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-7 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
