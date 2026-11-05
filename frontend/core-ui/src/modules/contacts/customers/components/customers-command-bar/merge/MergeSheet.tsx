import { useTranslation } from 'react-i18next';
import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { IconAlertTriangle, IconArrowMerge } from '@tabler/icons-react';
import { Alert, Button, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { MergeTooltip } from '@/contacts/customers/components/customers-command-bar/merge/MergeTooltip';

export const CUSTOMERS_MERGE_PANEL =
  'contacts/customers/customers-command-bar/merge/MergeSheet';

const noop = () => {
  //
};
interface MergeSheetProps
  extends Omit<React.ComponentProps<typeof CoreModulePanel>, 'name'> {
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
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  return (
    <CoreModulePanel
      name={CUSTOMERS_MERGE_PANEL}
      requiredPermission="contactsMerge"
      maxWidth={1000}
      defaultWidth={800}
      {...props}
    >
      <MergeTooltip disabled={!disabled}>
        <CoreModulePanel.Trigger asChild>
          <Button variant={'secondary'} disabled={disabled}>
            <IconArrowMerge />
            {t('action-merge')}
          </Button>
        </CoreModulePanel.Trigger>
      </MergeTooltip>
      <CoreModulePanel.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
        <MergeSheetHeader />
        {notice && (
          <Alert variant="warning" className="mx-6 mt-4 w-auto">
            <IconAlertTriangle />
            <Alert.Description>{notice}</Alert.Description>
          </Alert>
        )}
        <CoreModulePanel.Content className="min-h-0 overflow-y-auto">
          <div className={cn('w-full', className)}>{children}</div>
        </CoreModulePanel.Content>
        {!disabled && (
          <MergeSheetFooter
            saveLabel={saveLabel}
            onDiscard={onDiscard}
            onSave={onSave}
          />
        )}
      </CoreModulePanel.View>
    </CoreModulePanel>
  );
};

const MergeSheetHeader = () => (
  <CoreModulePanel.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
    <CoreModulePanel.Title>Merge Customers</CoreModulePanel.Title>
    <CoreModulePanel.Close />
  </CoreModulePanel.Header>
);

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
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
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
        {saveLabel ?? t('action-save')}
      </Button>
    </CoreModulePanel.Footer>
  );
};
