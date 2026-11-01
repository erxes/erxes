import { useTranslation } from 'react-i18next';
import { IconArrowMerge } from '@tabler/icons-react';
import { Button, Sheet, Spinner, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { CompaniesMergeTooltip } from '@/contacts/companies/components/companies-command-bar/CompaniesMergeTooltip';

const noop = () => {
  //
};

interface CompaniesMergeSheetProps extends React.ComponentProps<typeof Sheet> {
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
  return (
    <Sheet {...props}>
      <CompaniesMergeTooltip disabled={!disabled}>
        <Sheet.Trigger asChild>
          <Button variant="secondary" disabled={disabled}>
            <IconArrowMerge />
            {t('action-merge')}
          </Button>
        </Sheet.Trigger>
      </CompaniesMergeTooltip>
      <Sheet.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
        <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
          <Sheet.Title>{t('merge-title')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Description className="sr-only">
          {t('merge-tooltip')}
        </Sheet.Description>
        <Sheet.Content className="min-h-0 overflow-y-auto">
          <div className={cn('w-full', className)}>{children}</div>
        </Sheet.Content>
        {!disabled && (
          <Sheet.Footer className="flex justify-end p-5">
            <Button variant="secondary" onClick={onDiscard} disabled={saving}>
              {t('action-discard')}
            </Button>
            <Button onClick={onSave} disabled={saving || saveDisabled}>
              {saving && <Spinner containerClassName="inline-flex flex-none" />}
              {t('action-save')}
            </Button>
          </Sheet.Footer>
        )}
      </Sheet.View>
    </Sheet>
  );
};
