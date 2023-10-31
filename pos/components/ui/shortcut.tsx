import { cn } from "@/lib/utils"

function Shortcut({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-neutral-400/10 h-5 px-0.5 inline-flex items-center justify-center rounded",
        className
      )}
      {...props}
    />
  )
}

export { Shortcut }
