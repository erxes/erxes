import { useTranslation } from 'react-i18next';
import {
  IconArrowMerge,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react';
import { Button, Sheet, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { MergeTooltip } from '@/contacts/customers/components/customers-command-bar/merge/MergeTooltip';

const noop = () => {
  //
};
interface MergeSheetProps extends React.ComponentProps<typeof Sheet> {
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  onDiscard?: () => void;
  onSave?: () => void;
}

export const MergeSheet = ({
  children,
  disabled = false,
  className,
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
        <Sheet.Content className="min-h-0 overflow-y-auto">
          <div className={cn('w-full', className)}>{children}</div>
        </Sheet.Content>
        {!disabled && (
          <MergeSheetFooter onDiscard={onDiscard} onSave={onSave} />
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
  onDiscard: () => void;
  onSave: () => void;
}

const MergeSheetFooter = ({ onDiscard, onSave }: MergeSheetFooterProps) => {
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
        {t('action-save')}
      </Button>
    </Sheet.Footer>
  );
};
