import { Button, useToast, useConfirm } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useDeletePricing } from '@/pricing/hooks/useDeletePricing';

interface PricingDeleteProps {
  pricingIds: string;
  onDeleteSuccess?: () => void;
}

export const PricingDelete = ({
  pricingIds,
  onDeleteSuccess,
}: PricingDeleteProps) => {
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
      message: `Are you sure you want to delete the ${pricingCount} selected pricing item(s)?`,
      options: confirmOptions,
    }).then(async () => {
      try {
        await Promise.all(ids.map((id) => deletePricing(id)));

        if (onDeleteSuccess) {
          onDeleteSuccess();
        }

        toast({
          title: 'Success',
          description: 'Selected pricing item(s) deleted successfully.',
          variant: 'success',
        });

        navigate('/settings/loyalty/pricing');
      } catch (e: any) {
        toast({
          title: 'Error',
          description: e.message || 'Failed to delete pricing. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      <IconTrash className="mr-2 w-4 h-4" />
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
};
