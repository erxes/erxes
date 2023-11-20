import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const value = props.value || (" " as any)

    const textareaStyle = {
      minHeight: "50px",
      height: `${Math.max(50, value.split("\n").length * 20)}px`,
      maxHeight: "300px",
    }

    return (
      <textarea
        style={textareaStyle}
        className={cn(
          "flex h-10 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2  ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
