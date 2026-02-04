"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, type = "text", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#4a3023] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full h-12 px-4",
            // Inset field effect - carved into surface
            "bg-[#f7f3eb] text-[#2d2a26]",
            "border-2 border-[#c9bda8] rounded-lg",
            // Inset shadow for depth
            "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),_inset_0_1px_2px_rgba(0,0,0,0.05)]",
            "placeholder:text-[#9a8a7a]",
            "transition-all duration-200",
            // Focus: brass accent
            "focus:outline-none focus:border-[#c9a959] focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),_0_0_0_2px_rgba(201,169,89,0.2)]",
            // Disabled
            "disabled:bg-[#e8e0d0] disabled:text-[#9a8a7a] disabled:cursor-not-allowed",
            // Error state
            error &&
              "border-[#a34a4a] focus:border-[#a34a4a] focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),_0_0_0_2px_rgba(163,74,74,0.2)]",
            className,
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-sm text-[#6b5e4f]">{hint}</p>
        )}
        {error && <p className="mt-2 text-sm text-[#a34a4a]">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
