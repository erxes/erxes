import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { IconArrowMerge } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { CompaniesMergeTooltip } from '@/contacts/companies/components/companies-command-bar/CompaniesMergeTooltip';

const noop = () => {
  //
};
interface CompaniesMergeSheetProps
  extends Omit<React.ComponentProps<typeof CoreModulePanel>, 'name'> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  onDiscard?: () => void;
  onSave?: () => void;
}

export const CompaniesMergeSheet = ({
  children,
  disabled = false,
  className,
  onDiscard = noop,
  onSave = noop,
  ...props
}: CompaniesMergeSheetProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <CoreModulePanel
      maxWidth={1000}
      defaultWidth={800}
      name={'contacts/companies/companies-command-bar/CompaniesMergeSheet'}
      {...props}
    >
      <CoreModulePanel.Trigger asChild>
        <Button variant={'secondary'} disabled={disabled}>
          <IconArrowMerge />
          {t('action-merge')}
        </Button>
      </CoreModulePanel.Trigger>
      <CoreModulePanel.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
        <CoreModulePanel.Description className="sr-only" />
        <CompaniesMergeSheetHeader />
        <CoreModulePanel.Content>
          <div className={cn('w-full h-full overflow-y-auto ', className)}>
            {children}
          </div>
        </CoreModulePanel.Content>
        {!disabled && (
          <CompaniesMergeSheetFooter onDiscard={onDiscard} onSave={onSave} />
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};

const CompaniesMergeSheetHeader = () => (
  <CoreModulePanel.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
    <CoreModulePanel.Title>Merge Companies</CoreModulePanel.Title>
    <CoreModulePanel.Close />
  </CoreModulePanel.Header>
);

interface CompaniesMergeSheetFooterProps {
  onDiscard: () => void;
  onSave: () => void;
}

const CompaniesMergeSheetFooter = ({
  onDiscard,
  onSave,
}: CompaniesMergeSheetFooterProps) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <CoreModulePanel.Footer className="flex justify-end p-5">
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
        {t('action-save')}
      </Button>
    </CoreModulePanel.Footer>
  );
};

export const CompaniesMergeSheetTrigger = ({
  disabled = false,
}: {
  disabled?: boolean;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'company' });
  return (
    <CompaniesMergeTooltip disabled={!disabled}>
      <Button variant={'secondary'} disabled={disabled}>
        <IconArrowMerge />
        {t('action-merge')}
      </Button>
    </CompaniesMergeTooltip>
  );
};
