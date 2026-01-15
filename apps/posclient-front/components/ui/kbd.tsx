import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <kbd
      className={cn(
        "bg-neutral-400/10 h-5 px-0.5 inline-flex items-center justify-center rounded",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
