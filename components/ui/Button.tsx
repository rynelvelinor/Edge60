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
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-medium",
      "rounded-xl transition-all duration-200",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:opacity-50 disabled:pointer-events-none"
    );

    const variants = {
      primary: cn(
        "bg-indigo-600 text-white",
        "hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25",
        "active:bg-indigo-800",
        "focus-visible:ring-indigo-500"
      ),
      secondary: cn(
        "bg-slate-100 text-slate-700",
        "border border-slate-200",
        "hover:bg-slate-200 hover:border-slate-300",
        "active:bg-slate-300",
        "focus-visible:ring-slate-400"
      ),
      ghost: cn(
        "text-slate-600",
        "hover:bg-slate-100 hover:text-slate-900",
        "active:bg-slate-200",
        "focus-visible:ring-slate-400"
      ),
      dark: cn(
        "bg-slate-900 text-white",
        "hover:bg-slate-800",
        "active:bg-slate-950",
        "focus-visible:ring-slate-500"
      ),
      danger: cn(
        "bg-red-50 text-red-600 border border-red-200",
        "hover:bg-red-100 hover:border-red-300",
        "active:bg-red-200",
        "focus-visible:ring-red-400"
      ),
    };

    const sizes = {
      sm: "h-9 px-4 text-sm gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-7 text-base gap-2",
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
  }
);

Button.displayName = "Button";
