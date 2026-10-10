import { Button, DropdownMenu } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconEye,
  IconTrash,
  IconEdit,
  IconDotsVertical,
  IconPrinter,
} from '@tabler/icons-react';
import { IDeal } from '@/deals/types/deals';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DealPrintDocument } from '@/deals/actionBar/components/DealPrintDocument';
import { useDealActions } from '@/deals/actionBar/hooks/useDealActions';

export const DealsActions = ({
  deals,
  selectedCount,
  triggerLabel,
}: {
  deals: IDeal[];
  selectedCount?: number;
  triggerLabel?: string;
}) => {
  const { t } = useTranslation('sales');
  const {
    archiveLabel,
    count,
    handleArchive,
    handleCopy,
    handleRemove,
    handleWatch,
    isLoading,
    isSingle,
    showRemove,
    watchLabel,
  } = useDealActions({ deals, selectedCount });
  const [printOpen, setPrintOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            {isSingle ? <IconDotsVertical /> : <IconEdit />}
            {triggerLabel || t('edit')}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-48 min-w-fit!">
          <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
            <IconCopy />
            {t('duplicate')} {isSingle ? '' : `(${count})`}
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
            <IconEye />
            {watchLabel} {isSingle ? '' : `(${count})`}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => setPrintOpen(true)}
            disabled={isLoading}
            className="text-primary"
          >
            <IconPrinter />
            {t('print', 'Print')} {isSingle ? '' : `(${count})`}
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={handleArchive} disabled={isLoading}>
            <IconArchive />
            {archiveLabel} {isSingle ? '' : `(${count})`}
          </DropdownMenu.Item>

          {showRemove && (
            <DropdownMenu.Item
              onClick={handleRemove}
              disabled={isLoading}
              className="text-red-700 focus:text-red-700"
            >
              <IconTrash className="text-red-700" />
              {t('remove')} {isSingle ? '' : `(${count})`}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu>
      <DealPrintDocument
        deals={deals}
        open={printOpen}
        onOpenChange={setPrintOpen}
      />
    </>
  );
};
