import { Button, useToast, useConfirm } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDeletePricing } from '@/pricing/hooks/useDeletePricing';

interface PricingDeleteProps {
  pricingIds: string;
  onDeleteSuccess?: () => void;
}

export const PricingDelete = ({
  pricingIds,
  onDeleteSuccess,
}: PricingDeleteProps) => {
  const { t } = useTranslation('loyalty');
  const { deletePricing, loading } = useDeletePricing();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const confirmOptions = { confirmationValue: 'delete' };

  const pricingCount = pricingIds.includes(',')
    ? pricingIds.split(',').length
    : 1;

  const handleDelete = async () => {
    const ids = pricingIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!ids.length) {
      return;
    }

    confirm({
      message: t('delete-pricing-confirm', { count: pricingCount }),
      options: confirmOptions,
    }).then(async () => {
      try {
        await Promise.all(ids.map((id) => deletePricing(id)));

        if (onDeleteSuccess) {
          onDeleteSuccess();
        }

        toast({
          title: t('success'),
          description: t('pricing-deleted', { count: pricingCount }),
          variant: 'success',
        });

        navigate('/settings/loyalty/pricing');
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('pricing-delete-failed'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      <IconTrash className="w-4 h-4 mr-2" />
      {loading ? t('deleting') : t('delete')}
    </Button>
  );
};
