import { IconRepeat } from '@tabler/icons-react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popover } from 'erxes-ui';

interface BulkEditPopoverProps {
  children: ReactNode;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkEditPopover = ({
  children,
  loading,
  open,
  onOpenChange,
}: BulkEditPopoverProps) => {
  const { t } = useTranslation('content');

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <Button variant="secondary" size="sm" disabled={loading}>
          <IconRepeat className="size-4" />
          {t('actions')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="min-w-[280px] p-0" align="end" side="top" sideOffset={10}>
        {children}
      </Popover.Content>
    </Popover>
  );
};
