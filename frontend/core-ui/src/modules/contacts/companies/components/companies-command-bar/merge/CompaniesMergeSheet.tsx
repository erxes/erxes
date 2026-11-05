import { useTranslation } from 'react-i18next';
import { IconArrowMerge } from '@tabler/icons-react';
import { Button, Spinner, cn } from 'erxes-ui';
import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { ReactNode } from 'react';
import { CompaniesMergeTooltip } from './CompaniesMergeTooltip';

const noop = () => {
  //
};

interface CompaniesMergeSheetProps
  extends Omit<React.ComponentProps<typeof CoreModulePanel>, 'name'> {
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
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  // The tooltip explains why Merge is disabled, so it only shows then.
  const hideTooltip = !disabled;
  const showFooter = !disabled;
  const saveButtonDisabled = saving || saveDisabled;
  const contentClassName = cn('w-full', className);

  return (
    <CoreModulePanel
      name="contacts/companies/merge"
      requiredPermission="contactsMerge"
      maxWidth={1000}
      defaultWidth={800}
      {...props}
    >
      <CompaniesMergeTooltip disabled={hideTooltip}>
        <CoreModulePanel.Trigger asChild>
          <Button variant="secondary" disabled={disabled}>
            <IconArrowMerge />
            {t('action-merge')}
          </Button>
        </CoreModulePanel.Trigger>
      </CompaniesMergeTooltip>
      <CoreModulePanel.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
        <CoreModulePanel.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
          <CoreModulePanel.Title>{t('merge-title')}</CoreModulePanel.Title>
          <CoreModulePanel.Close />
        </CoreModulePanel.Header>
        <CoreModulePanel.Description className="sr-only">
          {t('merge-tooltip')}
        </CoreModulePanel.Description>
        <CoreModulePanel.Content className="min-h-0 overflow-y-auto">
          <div className={contentClassName}>{children}</div>
        </CoreModulePanel.Content>
        {showFooter && (
          <CoreModulePanel.Footer className="flex justify-end p-5">
            <Button variant="secondary" onClick={onDiscard} disabled={saving}>
              {t('action-discard')}
            </Button>
            <Button onClick={onSave} disabled={saveButtonDisabled}>
              {saving && <Spinner containerClassName="inline-flex flex-none" />}
              {t('action-save')}
            </Button>
          </CoreModulePanel.Footer>
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};
