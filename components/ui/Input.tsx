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
            className="block text-label text-slate-700 mb-2"
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
            "bg-white text-slate-900",
            "border border-slate-300 rounded-xl",
            "placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            error && "border-red-400 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
