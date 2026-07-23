import { Cell } from '@tanstack/react-table';
import { IconCopy } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useToast,
} from 'erxes-ui';
import { ICoupon } from '../types/coupon';

export const CouponMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICoupon, unknown>;
}) => {
  const { code } = cell.row.original;
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const handleCopyCode = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setOpen(false);
      toast({
        title: t('copied'),
        description: code,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        align="start"
        className="w-[280px] min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item
              value="copy-code"
              onSelect={handleCopyCode}
              disabled={!code}
            >
              <IconCopy className="size-4" />
              {t('copy-code')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const couponMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: CouponMoreColumnCell,
  size: 25,
};
