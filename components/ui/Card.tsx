"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "filled" | "dark" | "felt";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      // Default: Ivory cardstock with subtle shadow
      default: cn(
        "bg-[#fffef8] border-2 border-[#c9bda8]",
        "shadow-[3px_3px_12px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.8)]",
      ),

      // Outlined: Just border, no fill
      outlined: cn("bg-[#f7f3eb] border-2 border-[#c9bda8]"),

      // Filled: Cream background
      filled: cn("bg-[#f7f3eb]"),

      // Dark: Mahogany wood tone
      dark: cn(
        "bg-[#4a3023] text-[#f7f3eb] border-2 border-[#2a1a13]",
        "shadow-[3px_3px_12px_rgba(0,0,0,0.25)]",
      ),

      // Felt: Casino table surface
      felt: cn(
        "bg-[#1e3a2f] text-[#f7f3eb] border-2 border-[#4a3023]",
        "shadow-[3px_3px_12px_rgba(0,0,0,0.3)]",
        "relative overflow-hidden",
      ),
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-xl", variants[variant], className)}
        {...props}
      >
        {/* Subtle noise texture for felt cards */}
        {variant === "felt" && (
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-6 py-5 border-b-2 border-[#e8e0d0]", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-h3 text-[#2d2a26]", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body-sm text-[#6b5e4f] mt-1", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-6 py-4 border-t-2 border-[#e8e0d0] bg-[#f7f3eb] rounded-b-xl",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
