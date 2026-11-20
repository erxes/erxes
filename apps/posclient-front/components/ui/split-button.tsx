import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const optionVariants = cva(
  "rounded-none shadow-none first:rounded-s-xl last:rounded-e-xl focus-visible:z-10 flex-none px-0",
  {
    variants: {
      size: {
        default: "h-10 w-10",
        lg: "h-12 w-12",
        sm: "h-9 w-9",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export default function SplitButton({
  children,
  className,
  size,
  options,
  onClick,
  loading,
  ...props
}: ButtonProps & { options?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "inline-flex divide-x divide-primary-foreground/30 rounded-lg shadow-button-primary",
        className
      )}
    >
      <Button
        className={cn(
          "rounded-none shadow-none first:rounded-s-xl last:rounded-e-xl focus-visible:z-10 flex-auto px-0",
          size === "lg" && "h-12"
        )}
        size={size}
        onClick={onClick}
        loading={loading}
        {...props}
      >
        {children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={optionVariants({ size })}
            size="icon"
            aria-label="Options"
            disabled={loading}
            {...props}
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        {!!options && <DropdownMenuContent>{options}</DropdownMenuContent>}
      </DropdownMenu>
    </div>
  )
}
