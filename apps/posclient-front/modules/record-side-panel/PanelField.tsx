import { FileTextIcon, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import { PanelLabel } from "./PanelLabel"

const isEmpty = (value: React.ReactNode) =>
  value === undefined || value === null || value === "" || value === false

export const PanelField = ({
  label,
  icon: Icon = FileTextIcon,
  children,
  placeholder,
  bare = false,
}: {
  label: React.ReactNode
  icon?: LucideIcon
  placeholder?: React.ReactNode
  children?: React.ReactNode
  bare?: boolean
}) => {
  let value: React.ReactNode = <PanelFieldValue>{children}</PanelFieldValue>
  if (bare) {
    value = children
  } else if (isEmpty(children)) {
    value = (
      <span className="flex h-7 items-center gap-1.5 px-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        {placeholder ?? label}
      </span>
    )
  }

  return (
    <div className="grid min-h-7 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-2">
      <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <PanelLabel>{label}</PanelLabel>
      </div>
      <div className="relative min-w-0 text-xs">{value}</div>
    </div>
  )
}

export const PanelFieldValue = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div
    className={cn(
      "flex min-h-7 min-w-0 items-center gap-1.5 rounded-sm px-2 font-normal",
      className
    )}
  >
    {children}
  </div>
)
