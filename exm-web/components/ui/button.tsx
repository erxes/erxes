"use client"

import * as React from "react"
import { useRef } from "react"
import type { LinkProps } from "next/link"
import { VariantProps, cva } from "class-variance-authority"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { mergeRefs } from "react-merge-refs"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md text-sm font-extrabold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  Component?: string | React.JSXElementConstructor<any>
  href?: LinkProps["href"]
  loading?: boolean
  target?: string
  iconOnly?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, buttonRef) => {
    const {
      className,
      variant,
      size,
      Component = "button",
      children,
      loading,
      disabled,
      iconOnly,
      ...rest
    } = props
    const ref = useRef<any>(null)
    return (
      <Component
        {...rest}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={mergeRefs([ref, buttonRef])}
        disabled={disabled || loading}
      >
        <AnimatePresence>
          {loading && (
            <motion.div
              initial="initial"
              animate="animate"
              exit="initial"
              variants={iconOnly ? undefined : animateVariants}
              className={cn("overflow-hidden", !iconOnly && "-ml-1")}
            >
              <Loader2
                className={cn("h-4 w-4 animate-spin", !iconOnly && "mr-2")}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {!(iconOnly && loading) && children}
      </Component>
    )
  }
)
Button.displayName = "Button"

const animateVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
}

export { Button, buttonVariants }
