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
import { DealChipButton } from '@/deals/components/deal-selects/DealChipTrigger';
import { useTranslation } from 'react-i18next';
import { DealPrintDocument } from '@/deals/actionBar/components/DealPrintDocument';
import { useDealActions } from '@/deals/actionBar/hooks/useDealActions';

export const DealsActions = ({
  deals,
  selectedCount,
  triggerLabel,
  variant = 'dropdown',
  watchOnly = false,
}: {
  deals: IDeal[];
  selectedCount?: number;
  triggerLabel?: string;
  variant?: 'dropdown' | 'inline' | 'watch';
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

  if (variant === 'watch' || watchOnly) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleWatch}
        disabled={isLoading}
      >
        <IconEye />
        {watchLabel}
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <>
        <DealChipButton onClick={handleCopy} disabled={isLoading}>
          <IconCopy />
          {t('duplicate')}
        </DealChipButton>
        <DealPrintDocument
          deals={deals}
          disabled={isLoading}
          trigger={
            <DealChipButton
              variant="secondary"
              className="text-primary shadow-none hover:bg-border"
            >
              <IconPrinter />
              {t('print', 'Print')}
            </DealChipButton>
          }
        />
        <DealChipButton onClick={handleArchive} disabled={isLoading}>
          <IconArchive />
          {archiveLabel}
        </DealChipButton>
        {showRemove && (
          <DealChipButton
            className="text-red-700 hover:text-red-700"
            onClick={handleRemove}
            disabled={isLoading}
          >
            <IconTrash />
            {t('remove')}
          </DealChipButton>
        )}
      </>
    );
  }

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
        <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
          <IconCopy />
          {t('duplicate')} {isSingle ? '' : `(${count})`}
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
          <IconEye />
          {watchLabel} {isSingle ? '' : `(${count})`}
        </DropdownMenu.Item>

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
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
