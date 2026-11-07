import { ReactNode } from 'react';
import { PagePanelStatus } from '@/side-panel/components/PagePanelStatus';
import { RecordSidePanel, SidePanelRecordPathContext } from 'ui-modules';
import {
  createPagePanelPortal as createPortal,
  usePagePanel,
  PagePanelContext,
  PagePanelOptions,
} from '@/side-panel/hooks/usePagePanel';
import { useTranslation } from 'react-i18next';
import { IconArrowMerge } from '@tabler/icons-react';
import { Button, Spinner, cn } from 'erxes-ui';
import { CompaniesMergeTooltip } from './CompaniesMergeTooltip';
const noop = () => {
  //
};
interface CompaniesMergeSheetProps extends Omit<PagePanelOptions, 'name'> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  saving?: boolean;
  saveDisabled?: boolean;
  onDiscard?: () => void;
  onSave?: () => void;
}
export const CompaniesMergeSheet = ({
  children,
  disabled = false,
  className,
  saving = false,
  saveDisabled = false,
  onDiscard = noop,
  onSave = noop,
  ...props
}: CompaniesMergeSheetProps) => {
  const { t } = useTranslation('contact', {
    keyPrefix: 'company',
  });
  // The tooltip explains why Merge is disabled, so it only shows then.
  const hideTooltip = !disabled;
  const showFooter = !disabled;
  const saveButtonDisabled = saving || saveDisabled;
  const contentClassName = cn('w-full', className);
  const pagePanel = usePagePanel({
    name: 'contacts/companies/merge',
    requiredPermission: 'contactsMerge',
    maxWidth: 1000,
    defaultWidth: 800,
    ...props,
  });
  return (
    <PagePanelContext.Provider value={pagePanel}>
      <SidePanelRecordPathContext.Provider value={pagePanel.path}>
        <CompaniesMergeTooltip disabled={hideTooltip}>
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={pagePanel.onOpen}
          >
            <IconArrowMerge />
            {t('action-merge')}
          </Button>
        </CompaniesMergeTooltip>
        {pagePanel.open && pagePanel.target
          ? createPortal(
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
                {pagePanel.permissionsLoaded && pagePanel.allowed ? (
                  <>
                    <RecordSidePanel.Header
                      title={<>{t('merge-title')}</>}
                      onBack={pagePanel.onBack}
                      onClose={pagePanel.onClose}
                      expanded={pagePanel.expanded}
                      onExpand={pagePanel.onExpand}
                    />
                    <p className="sr-only">{t('merge-tooltip')}</p>
                    <div
                      className={cn(
                        'flex min-h-0 flex-1 flex-col overflow-y-auto',
                        'min-h-0 overflow-y-auto',
                      )}
                    >
                      <div className={contentClassName}>{children}</div>
                    </div>
                    {showFooter && (
                      <div
                        className={cn(
                          'flex shrink-0 items-center justify-end gap-1 border-t bg-background p-2',
                          'flex justify-end p-5',
                        )}
                      >
                        <Button
                          variant="secondary"
                          onClick={onDiscard}
                          disabled={saving}
                        >
                          {t('action-discard')}
                        </Button>
                        <Button onClick={onSave} disabled={saveButtonDisabled}>
                          {saving && (
                            <Spinner containerClassName="inline-flex flex-none" />
                          )}
                          {t('action-save')}
                        </Button>
                      </div>
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
