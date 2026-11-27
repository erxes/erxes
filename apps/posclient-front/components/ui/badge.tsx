import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-hidden focus-visible:shadow-focus",
  {
    variants: {
      variant: {
        default:
          "border-primary/10 bg-primary/10 text-primary",
        secondary:
          "border-transparent bg-accent text-foreground",
        destructive:
          "border-destructive/10 bg-destructive/10 text-destructive",
        outline: "border-border bg-background text-foreground",
        success: "border-success/15 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        info: "border-info/15 bg-info/10 text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
