import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext } from '@tanstack/table-core';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeletePricing } from '@/pricing/hooks/useDeletePricing';
import { IPricing } from '@/pricing/types';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const PricingMoreCell = ({ row }: CellContext<IPricing, unknown>) => {
  const pricing = row.original;
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { deletePricing, loading } = useDeletePricing();
  const { t } = useTranslation('loyalty');

  const handleEdit = () => {
    navigate(`/settings/loyalty/pricing/${pricing._id}`);
  };

  const handleDelete = () => {
    confirm({
      message: t('delete-pricing-by-name', { name: pricing.name }),
      options: {
        confirmationValue: 'delete',
      },
    }).then(async () => {
      try {
        await deletePricing(pricing._id);

        toast({
          title: t('success'),
          description: t('pricing-deleted', { count: 1 }),
          variant: 'success',
        });
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description: getErrorMessage(
            error,
            t('pricing-delete-failed'),
          ),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        side="right"
        align="start"
        avoidCollisions={false}
        className="w-44 min-w-0 [&>button]:cursor-pointer"
        onClick={(event) => event.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={handleEdit}
              >
                <IconEdit className="size-4" />
                {t('edit')}
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8 text-destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <IconTrash className="size-4" />
                {t('delete')}
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
