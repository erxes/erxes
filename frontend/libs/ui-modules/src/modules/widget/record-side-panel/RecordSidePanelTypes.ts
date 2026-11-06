import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';
export interface IRecordSidePanelTab {
  value: string;
  label: string;
  icon: Icon;
  content: ReactNode;
}
export type PanelExpansionContextValue = {
  expanded: boolean;
  toggle: () => void;
} | null;

export type RecordSidePanelResizeHandleProps = {
  width: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
};

export type RecordSidePanelRootProps = {
  className?: string;
  width?: number;
  // Larger surfaces can opt in without widening record panels.
  maxWidth?: number;
  // Makes the panel resizable from its left edge.
  onWidthChange?: (width: number) => void;
  expanded?: boolean;
  expandedMode?: 'viewport' | 'page';
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
};

export type RecordSidePanelHeaderProps = {
  className?: string;
  // Shown when the panel came here from another record.
  onBack?: () => void;
  avatar?: ReactNode;
  title: ReactNode;
  // The record's own actions (e.g. a "more" menu), before expand and close.
  actions?: ReactNode;
  onExpand?: () => void;
  onClose: () => void;
};

export type RecordSidePanelTabsProps = {
  tabs: IRecordSidePanelTab[];
  value: string;
  onValueChange: (value: string) => void;
  visibleCount?: number;
  overviewTab?: string;
  expandedDefaultTab?: string;
};
