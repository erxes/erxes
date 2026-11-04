import type { Sheet } from 'erxes-ui';
import type { ComponentProps, ReactNode } from 'react';
export type TModulePanelProps = ComponentProps<typeof Sheet> & {
  name: string;
  maxWidth?: number;
  defaultWidth?: number;
  requiredPermission?: string;
};

export type TModulePanelViewProps = ComponentProps<typeof Sheet.View> & {
  loading?: boolean;
  error?: boolean;
  notFound?: boolean;
  errorState?: ReactNode;
  notFoundState?: ReactNode;
};

export type ModulePanelContextValue = {
  path: string;
  name: string;
  open: boolean;
  allowed: boolean;
  onClose: () => void;
  onOpen: () => void;
} | null;
