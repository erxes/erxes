import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal,
  usePagePanel,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
import type { ReactNode } from 'react';
import { RecordSidePanel } from 'ui-modules';

/** Keeps product configuration editors beside their list in the core panel host. */
export const ProductEditorPanel = ({
  name,
  open,
  onOpenChange,
  requiredPermission,
  children,
}: {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPermission: string;
  children: ReactNode;
}) => {
  const entry = usePagePanel({
    name: `products/${name}`,
    open,
    onOpenChange,
    requiredPermission,
    expandable: false,
    defaultWidth: 520,
  });
  return createPagePanelPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {entry.permissionsLoaded && entry.allowed ? (
        children
      ) : (
        <PagePanelStatus entry={entry} />
      )}
    </div>,
    entry,
  );
};

export const ProductEditorHeader = ({ title }: { title: ReactNode }) => {
  const entry = usePagePanelContext();
  return <RecordSidePanel.Header title={title} {...entry.headerProps} />;
};
