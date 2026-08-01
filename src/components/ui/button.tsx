import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-brand-red text-white hover:bg-brand-red-dark hover:shadow-glow",
        secondary:
          "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/20",
        ghost: "text-gray-400 hover:text-white hover:bg-white/[0.06]",
        blue: "bg-brand-blue text-white hover:bg-brand-blue-dark hover:shadow-glow-blue",
        danger: "bg-red-600/15 text-red-400 hover:bg-red-600/25 border border-red-600/20",
        outline: "border border-white/15 text-white hover:bg-white/[0.06]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
