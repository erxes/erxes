import React from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

export const RecordTableMoreButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="icon"
    aria-label="Үйлдлүүд"
    className={cn(
      "h-8 w-full rounded-none focus-visible:shadow-focus focus-visible:outline-transparent",
      className
    )}
    {...props}
  >
    {children || (
      <MoreHorizontalIcon className="size-4 text-muted-foreground" />
    )}
  </Button>
))
RecordTableMoreButton.displayName = "RecordTableMoreButton"
