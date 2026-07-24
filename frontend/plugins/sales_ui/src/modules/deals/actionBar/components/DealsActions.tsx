import { Button, DropdownMenu } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconEye,
  IconTrash,
  IconEdit,
  IconDotsVertical,
} from '@tabler/icons-react';
import { IDeal } from '@/deals/types/deals';
import { useTranslation } from 'react-i18next';
import { DealPrintDocument } from '@/deals/actionBar/components/DealPrintDocument';
import { useDealActions } from '@/deals/actionBar/hooks/useDealActions';

export const DealsActions = ({
  deals,
  selectedCount,
  triggerLabel,
  watchOnly,
}: {
  deals: IDeal[];
  selectedCount?: number;
  triggerLabel?: string;
  watchOnly?: boolean;
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

  return (
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
        {!watchOnly && (
          <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
            <IconCopy />
            {t('duplicate')} {isSingle ? '' : `(${count})`}
          </DropdownMenu.Item>
        )}

        <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
          <IconEye />
          {watchLabel} {isSingle ? '' : `(${count})`}
        </DropdownMenu.Item>

        {!watchOnly && (
          <>
            <DealPrintDocument
              deals={deals}
              disabled={isLoading}
              variant="submenu"
            />

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
          </>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
