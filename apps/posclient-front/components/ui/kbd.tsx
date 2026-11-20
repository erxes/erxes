import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <kbd
      className={cn(
        "bg-muted shadow-xs h-5 px-1 inline-flex items-center justify-center rounded-sm font-mono text-[0.7rem] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
