import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export interface IRecordSidePanelTab {
  value: string
  label: string
  icon: LucideIcon
  count?: number
  content: ReactNode
}

export type PanelExpansionContextValue = {
  expanded: boolean
  toggle?: () => void
} | null

export type RecordSidePanelResizeHandleProps = {
  width: number
  minWidth?: number
  maxWidth: number
  onWidthChange: (width: number) => void
}

export type RecordSidePanelRootProps = {
  className?: string
  width?: number
  maxWidth?: number
  onWidthChange?: (width: number) => void
  expanded?: boolean
  expandedMode?: "viewport" | "page"
  onExpandedChange?: (expanded: boolean) => void
  expandable?: boolean
  children: ReactNode
}

export type RecordSidePanelHeaderProps = {
  className?: string
  avatar?: ReactNode
  title: ReactNode
  actions?: ReactNode
  onClose?: () => void
}

export type RecordSidePanelTabsProps = {
  tabs: IRecordSidePanelTab[]
  value: string
  onValueChange: (value: string) => void
  overviewTab?: string
  overviewHeader?: ReactNode
  expandedDefaultTab?: string
}

export type RecordSidePanelLayoutProps = RecordSidePanelTabsProps & {
  header?: ReactNode
}
