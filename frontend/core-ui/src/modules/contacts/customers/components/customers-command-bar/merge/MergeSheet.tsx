import { useTranslation } from 'react-i18next';
import {
  IconAlertTriangle,
  IconArrowMerge,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react';
import { Alert, Button, Sheet, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { MergeTooltip } from '@/contacts/customers/components/customers-command-bar/merge/MergeTooltip';

const noop = () => {
  //
};
interface MergeSheetProps extends React.ComponentProps<typeof Sheet> {
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
    <Sheet {...props}>
      <MergeTooltip disabled={!disabled}>
        <Sheet.Trigger asChild>
          <Button variant={'secondary'} disabled={disabled}>
            <IconArrowMerge />
            {t('action-merge')}
          </Button>
        </Sheet.Trigger>
      </MergeTooltip>
      <Sheet.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
        <MergeSheetHeader />
        {notice && (
          <Alert variant="warning" className="mx-6 mt-4 w-auto">
            <IconAlertTriangle />
            <Alert.Description>{notice}</Alert.Description>
          </Alert>
        )}
        <Sheet.Content className="min-h-0 overflow-y-auto">
          <div className={cn('w-full', className)}>{children}</div>
        </Sheet.Content>
        {!disabled && (
          <MergeSheetFooter
            saveLabel={saveLabel}
            onDiscard={onDiscard}
            onSave={onSave}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};

const MergeSheetHeader = () => (
  <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
    <Button variant="ghost" size="icon">
      <IconLayoutSidebarLeftCollapse />
    </Button>
    <Sheet.Title>Merge Customers</Sheet.Title>
    <Sheet.Close />
  </Sheet.Header>
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
    <Sheet.Footer className="flex justify-end p-5">
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
    </Sheet.Footer>
  );
};
