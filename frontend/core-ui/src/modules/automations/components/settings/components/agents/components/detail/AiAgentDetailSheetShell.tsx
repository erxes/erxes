import { type ReactNode } from 'react';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal,
  usePagePanel,
  PagePanelContext,
} from '@/side-panel/hooks/usePagePanel';

export const AiAgentDetailSheetShell = ({
  title,
  identity,
  onRequestClose,
  onClose,
  children,
}: {
  title: string;
  identity?: string;
  onRequestClose: (close: () => void) => void;
  onClose: () => void;
  children: (close: () => void) => ReactNode;
}) => {
  const entry = usePagePanel({
    maxWidth: 1000,
    defaultWidth: 720,
    name: 'automations/settings/agents/AiAgentDetailSheetShell',
    identity,
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });
  return (
    <PagePanelContext.Provider value={entry}>
      <SidePanelRecordPathContext.Provider value={entry.path}>
        {entry.open &&
          entry.target &&
          createPagePanelPortal(
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
              {entry.permissionsLoaded && entry.allowed ? (
                <>
                  <RecordSidePanel.Header
                    title={title}
                    onBack={entry.onBack}
                    onClose={() => onRequestClose(entry.onClose)}
                    expanded={entry.expanded}
                    onExpand={entry.onExpand}
                  />
                  {children(entry.onClose)}
                </>
              ) : (
                <PagePanelStatus entry={entry} />
              )}
            </div>,
            entry.target,
          )}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
