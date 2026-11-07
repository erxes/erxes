import { ReactNode } from 'react';
import { SidePanelRecordPathContext, RecordSidePanel } from 'ui-modules';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
  usePagePanelContext,
  PagePanelOptions,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle, IconArrowMerge } from '@tabler/icons-react';
import { Alert, Button, cn } from 'erxes-ui';
import { MergeTooltip } from '@/contacts/customers/components/customers-command-bar/merge/MergeTooltip';
export const CUSTOMERS_MERGE_PANEL =
  'contacts/customers/customers-command-bar/merge/MergeSheet';
const noop = () => {
  //
};
interface MergeSheetProps extends Omit<PagePanelOptions, 'name'> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  notice?: string;
  saveLabel?: string;
  onDiscard?: () => void;
  onSave?: () => void;
}
export const MergeSheet = ({
  children,
  disabled = false,
  className,
  notice,
  saveLabel,
  onDiscard = noop,
  onSave = noop,
  ...props
}: MergeSheetProps) => {
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer',
  });
  const pagePanel = usePagePanel({
    name: CUSTOMERS_MERGE_PANEL,
    requiredPermission: 'contactsMerge',
    maxWidth: 1000,
    defaultWidth: 800,
    ...props,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <MergeTooltip disabled={!disabled}>
          <Button
            variant={'secondary'}
            disabled={disabled}
            onClick={pagePanel.onOpen}
          >
            <IconArrowMerge />
            {t('action-merge')}
          </Button>
        </MergeTooltip>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <MergeSheetHeader />
                    {notice && (
                      <Alert variant="warning" className="mx-6 mt-4 w-auto">
                        <IconAlertTriangle />
                        <Alert.Description>{notice}</Alert.Description>
                      </Alert>
                    )}
                    <div
                      className={cn(
                        'flex min-h-0 flex-1 flex-col overflow-y-auto',
                        'min-h-0 overflow-y-auto',
                      )}
                    >
                      <div className={cn('w-full', className)}>{children}</div>
                    </div>
                    {!disabled && (
                      <MergeSheetFooter
                        saveLabel={saveLabel}
                        onDiscard={onDiscard}
                        onSave={onSave}
                      />
                    )}
                  </>
                ) : (
                  <PagePanelStatus entry={pagePanel} />
                )}
              </div>,
              pagePanel.target,
            )
          : null}
      </SidePanelRecordPathContext.Provider>
    </PagePanelContext.Provider>
  );
};
const MergeSheetHeader = () => {
  const pagePanel = usePagePanelContext();
  return (
    <RecordSidePanel.Header
      title={<>Merge Customers</>}
      onBack={pagePanel.onBack}
      onClose={pagePanel.onClose}
      expanded={pagePanel.expanded}
      onExpand={pagePanel.onExpand}
    />
  );
};
interface MergeSheetFooterProps {
  saveLabel?: string;
  onDiscard: () => void;
  onSave: () => void;
}
const MergeSheetFooter = ({
  saveLabel,
  onDiscard,
  onSave,
}: MergeSheetFooterProps) => {
  const { t } = useTranslation('contact', {
    keyPrefix: 'customer',
  });
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
        'flex justify-end p-5',
      )}
    >
      <Button
        onClick={() => {
          onDiscard();
        }}
        variant="secondary"
      >
        {t('action-discard')}
      </Button>
      <Button
        onClick={() => {
          onSave();
        }}
      >
        {saveLabel ?? t('action-save')}
      </Button>
    </div>
  );
};
