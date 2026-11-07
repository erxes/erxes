import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { useLayoutEffect, useRef } from 'react';
import { TemplateForm, useSidePanel, RecordSidePanel } from 'ui-modules';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';
export const CoreTemplatePanel = ({
  contentType,
  contentId,
  open,
  onOpenChange,
}: {
  contentType: string;
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('templates');
  const panel = useSidePanel();
  const currentPanel = useRef(panel);
  useLayoutEffect(() => {
    currentPanel.current = panel;
  }, [panel]);
  const name = `templates/new/${contentType}/${contentId}`;
  const pagePanel = usePagePanel({
    name: name,
    open: open,
    onOpenChange: onOpenChange,
  });
  return createPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {pagePanel.permissionsLoaded && pagePanel.allowed ? (
        <>
          <RecordSidePanel.Header
            title={<>{t('create-template', 'Create template')}</>}
            {...pagePanel.headerProps}
          />
          <TemplateForm
            contentType={contentType}
            contentId={contentId}
            onClose={() => {
              currentPanel.current.dismissPath(getModulePanelPath(name));
              onOpenChange(false);
            }}
          />
        </>
      ) : (
        <PagePanelStatus entry={pagePanel} />
      )}
    </div>,
    pagePanel,
  );
};
