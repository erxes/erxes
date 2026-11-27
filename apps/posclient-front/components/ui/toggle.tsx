"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
      colorMode: {
        dark: "ring-offset-slate-950 hover:bg-slate-800 hover:text-slate-400 focus-visible:ring-slate-300 data-[state=on]:bg-neutral-800 data-[state=on]:text-slate-50",
        default:
          "hover:bg-accent hover:text-muted-foreground focus-visible:ring-ring ring-offset-background data-[state=on]:bg-primary/10 data-[state=on]:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      colorMode: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, colorMode, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className, colorMode }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
