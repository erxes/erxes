import { IBroadcastMethodEnum } from '../../types';
import { ReactNode } from 'react';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanelContext,
} from '@/side-panel/hooks/usePagePanel';
/** The sheet a campaign is written in, whether it is new or being edited. */
export const BroadcastStepsSheetView = ({
  children,
}: {
  method?: IBroadcastMethodEnum | null;
  children: ReactNode;
}) => {
  const pagePanel = usePagePanelContext();
  return pagePanel.open && pagePanel.target
    ? createPortal(
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {pagePanel.permissionsLoaded && pagePanel.allowed ? (
            <>{children}</>
          ) : (
            <PagePanelStatus entry={pagePanel} />
          )}
        </div>,
        pagePanel.target,
      )
    : null;
};
