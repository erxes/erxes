import { Button } from 'erxes-ui/components';
import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from 'erxes-ui/hooks';
import { useToast } from 'erxes-ui';
import { useDeletePricing } from '@/pricing/hooks/useDeletePricing';

interface PricingDeleteProps {
  pricingIds: string;
  onDeleteSuccess?: () => void;
}

export const PricingDelete = ({
  pricingIds,
  onDeleteSuccess,
}: PricingDeleteProps) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { deletePricing, loading } = useDeletePricing();

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

    await confirm({
      message: `Are you sure you want to delete the ${pricingCount} selected pricing item(s)?`,
    });

    try {
      await Promise.all(ids.map((id) => deletePricing(id)));

      toast({
        title: 'Success',
        description: 'Selected pricing item(s) deleted successfully.',
      });

      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch {
      toast({
        title: 'Failed to delete pricing',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      disabled={loading}
      onClick={handleDelete}
    >
      <IconTrash />
      Delete
    </Button>
  );
};
