import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export const SettingsIconTile = ({ icon: Icon }: { icon: LucideIcon }) => (
  <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-muted">
    <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
  </div>
)

export const SettingsSection = ({
  title,
  description,
  icon,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) => (
  <section className="select-none overflow-hidden rounded-xl border bg-card">
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <SettingsIconTile icon={icon} />}
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold leading-none">{title}</h3>
          {description && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
    {children && (
      <div className={cn("border-t px-2 py-2", className)}>{children}</div>
    )}
  </section>
)

export const SettingsRow = ({
  title,
  description,
  htmlFor,
  control,
  children,
}: {
  title: string
  description?: string
  htmlFor?: string
  control?: React.ReactNode
  children?: React.ReactNode
}) => (
  <div className="rounded-lg px-2 py-2 transition-colors duration-150 hover:bg-muted/50">
    <div className="flex items-center justify-between gap-4">
      <label
        htmlFor={htmlFor}
        className={cn("min-w-0", htmlFor && "cursor-pointer")}
      >
        <span className="block text-xs font-medium leading-snug">{title}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </label>
      {control && <div className="flex-none">{control}</div>}
    </div>
    {children && <div className="mt-3">{children}</div>}
  </div>
)
