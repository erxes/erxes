import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';

export interface IRecordSidePanelTab {
  value: string;
  label: string;
  icon: Icon;
  content: ReactNode;
  /** A plugin's relation tab: the member drags it into place. Core's own tabs stay put. */
  sortable?: boolean;
}

export type RecordSidePanelResizeHandleProps = {
  width: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
};

export type RecordSidePanelRootProps = {
  className?: string;
  id?: string;
  label?: string;
  // Kept mounted while closed, like the assistant's running chats.
  hidden?: boolean;
  width?: number;
  // Larger surfaces can opt in without widening record panels.
  maxWidth?: number;
  // Makes the panel resizable from its left edge.
  onWidthChange?: (width: number) => void;
  expanded?: boolean;
  expandedMode?: 'viewport' | 'page';
  onExpandedChange?: (expanded: boolean) => void;
  expandable?: boolean;
  children: ReactNode;
};

export type RecordSidePanelHeaderProps = {
  className?: string;
  /** `page`: the header of a record's own page, on the page's background. */
  variant?: 'panel' | 'page';
  // Shown when the panel came here from another record.
  onBack?: () => void;
  avatar?: ReactNode;
  title: ReactNode;
  // The record's own actions (e.g. a "more" menu), before expand and close.
  actions?: ReactNode;
  onExpand?: () => void;
  // Page-owned portals can supply expansion without inheriting the host context.
  expanded?: boolean;
  // Without it there is no close button: a record's own page has nothing to
  // close back to.
  onClose?: () => void;
};

export type RecordSidePanelTabsProps = {
  // Page-owned portals explicitly share the host expansion state.
  expanded?: boolean;
  tabs: IRecordSidePanelTab[];
  value: string;
  onValueChange: (value: string) => void;
  visibleCount?: number;
  overviewTab?: string;
  // Tops the expanded overview column, level with the tab row beside it.
  overviewHeader?: ReactNode;
  expandedDefaultTab?: string;
};

export type RecordSidePanelLayoutProps = RecordSidePanelTabsProps & {
  header?: ReactNode;
  profile?: ReactNode;
};
