"use client"

import type { ButtonHTMLAttributes, JSXElementConstructor } from "react"
import { forwardRef } from "react"
import type { LinkProps } from "next/link"
import { cva, VariantProps } from "class-variance-authority"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const glossy =
  "relative border border-transparent shadow-button-primary [text-shadow:0_1px_1px_rgb(0_0_0/25%)] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-b before:from-white/20 before:opacity-50 before:transition-opacity before:duration-300 hover:before:opacity-100 after:pointer-events-none after:absolute after:inset-0 after:bottom-1/2 after:rounded-[inherit] after:bg-white/10 after:mix-blend-overlay"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-[color,background-color,box-shadow,opacity] duration-200 outline-offset-2 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring/70 disabled:opacity-50 disabled:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: cn(glossy, "bg-primary text-primary-foreground"),
        destructive: cn(glossy, "bg-destructive text-destructive-foreground"),
        outline:
          "bg-background shadow-button-outline hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-border",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8 text-sm font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  Component?: string | JSXElementConstructor<any>
  href?: LinkProps["href"]
  loading?: boolean
  target?: string
  iconOnly?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
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
    return (
      <Component
        {...rest}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={buttonRef}
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
