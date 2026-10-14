import { useState } from 'react';
import { Button, DropdownMenu } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import {
  IconArchive,
  IconCopy,
  IconDots,
  IconEye,
  IconPrinter,
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
  variant = 'dropdown',
  watchOnly = false,
}: {
  deals: IDeal[];
  selectedCount?: number;
  triggerLabel?: string;
  variant?: 'dropdown' | 'watch' | 'menu';
  watchOnly?: boolean;
}) => {
  const { t } = useTranslation('sales');
  const [printOpen, setPrintOpen] = useState(false);
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
        onClick={() => void handleWatch()}
        disabled={isLoading}
      >
        <IconEye />
        {watchLabel}
      </Button>
    );
  }

  if (variant === 'menu') {
    return (
      <>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={isLoading}
              aria-label={t('actions', 'Actions')}
            >
              <IconDots />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="w-48 min-w-fit!">
            <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
              <IconEye />
              {watchLabel}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
              <IconCopy />
              {t('duplicate')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => setPrintOpen(true)}
              disabled={isLoading}
              className="text-primary"
            >
              <IconPrinter />
              {t('print', 'Print')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={handleArchive} disabled={isLoading}>
              <IconArchive />
              {archiveLabel}
            </DropdownMenu.Item>
            {showRemove && (
              <DropdownMenu.Item
                onClick={handleRemove}
                disabled={isLoading}
                className="text-red-700 focus:text-red-700"
              >
                <IconTrash className="text-red-700" />
                {t('remove')}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
        <PrintDocument
          items={deals}
          contentType="sales:deal"
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
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
