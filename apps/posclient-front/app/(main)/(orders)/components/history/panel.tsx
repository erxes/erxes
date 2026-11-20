import { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const PanelSection = ({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <section className={cn("pt-1", className)}>
    <h3 className="flex h-7 items-center px-1 text-xs font-normal text-muted-foreground">
      {title}
    </h3>
    <div className="flex min-w-0 flex-col gap-1 pb-1">{children}</div>
  </section>
)

export const PanelField = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children?: React.ReactNode
}) => (
  <div className="grid min-h-7 grid-cols-[8rem_minmax(0,1fr)] items-center gap-x-2">
    <div className="flex min-w-0 items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground/80">
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </div>
    <div className="flex min-h-7 min-w-0 items-center rounded-sm px-2 text-xs font-medium">
      {children === undefined || children === null || children === "" ? (
        <span className="font-normal text-muted-foreground">—</span>
      ) : (
        children
      )}
    </div>
  </div>
)
