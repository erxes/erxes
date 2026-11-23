import { FileTextIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import { PanelLabel } from "./PanelLabel"

export const PANEL_INPUT_CLASS_NAME =
  "h-7 rounded-sm border-0 bg-transparent px-2 text-xs font-normal shadow-none transition-colors placeholder:text-zinc-400 hover:bg-accent focus-visible:bg-background focus-visible:shadow-focus"

export const PanelFormRow = ({
  label,
  icon: Icon = FileTextIcon,
  required,
  error,
  children,
}: {
  label: React.ReactNode
  icon?: LucideIcon
  required?: boolean
  error?: string
  children: React.ReactNode
}) => (
  <div className="grid min-h-7 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-2 gap-y-0.5">
    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <PanelLabel>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </PanelLabel>
    </span>
    <div className="relative min-w-0 text-xs">{children}</div>
    {error && (
      <span className="col-start-2 text-xs text-destructive">{error}</span>
    )}
  </div>
)

export const PanelFormLayout = ({
  children,
  onCancel,
  saving,
  saveLabel = "Хадгалах",
  summary,
}: {
  children: React.ReactNode
  onCancel: () => void
  saving?: boolean
  saveLabel?: string
  summary?: React.ReactNode
}) => (
  <div className="flex min-h-0 flex-1 flex-col">
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-1 p-3">{children}</div>
    </div>
    <div className="flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2">
      {summary && <div className="mr-auto min-w-0 px-1">{summary}</div>}
      <Button
        type="button"
        variant="ghost"
        className="h-8 rounded px-3 text-[13px] font-medium"
        onClick={onCancel}
      >
        Болих
      </Button>
      <Button
        type="submit"
        className="h-8 rounded px-3 text-[13px] font-medium"
        loading={saving}
      >
        {saveLabel}
      </Button>
    </div>
  </div>
)
