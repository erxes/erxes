"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<
  HTMLInputElement,
  InputProps & { focus?: boolean }
>(({ className, type, focus = true, ...props }, ref) => {
  return (
    <>
      <input
        autoComplete="off"
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2  ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    </>
  )
})
Input.displayName = "Input"

export { Input }
