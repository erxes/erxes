import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useRemoveCategories } from '@/products/product-category/hooks/useRemoveCategories';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { Can } from 'ui-modules';

const CONFIRM_OPTIONS = { confirmationValue: 'delete' };

interface CategoriesDeleteProps {
  categoryIds: string;
  onDeleteSuccess?: () => void;
  children?: (args: { onClick: () => void; disabled: boolean }) => ReactNode;
}

export const CategoriesDelete = ({
  categoryIds,
  onDeleteSuccess,
  children,
}: CategoriesDeleteProps) => {
  const { confirm } = useConfirm();
  const { removeCategory, loading } = useRemoveCategories();
  const { toast } = useToast();

  const categoryCount = categoryIds.includes(',')
    ? categoryIds.split(',').length
    : 1;

  const disabled = loading || !categoryIds?.trim();

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }

    confirm({
      message:
        categoryCount === 1
          ? 'Are you sure you want to delete this category?'
          : `Are you sure you want to delete the ${categoryCount} selected categories?`,
      options: CONFIRM_OPTIONS,
    })
      .then(() => {
        removeCategory(categoryIds, {
          onError: ({ succeededIds, errors }) => {
            const failedCount = categoryCount - succeededIds.length;
            const failureReason =
              failedCount === 1
                ? errors[0]?.message || 'Failed to delete category.'
                : errors.map(({ message }) => message).join(' ') ||
                  `Failed to delete ${failedCount} categories.`;
            const partialSuccess =
              succeededIds.length > 0
                ? `${succeededIds.length} deleted, ${failedCount} failed. `
                : '';

            toast({
              title: 'Error',
              description: `${partialSuccess}${failureReason}`,
              variant: 'destructive',
            });
          },
          onCompleted: (succeededIds) => {
            const succeededCount = succeededIds.length;

            toast({
              title: 'Success',
              description: `${succeededCount} ${
                succeededCount === 1 ? 'category' : 'categories'
              } deleted successfully.`,
              variant: 'success',
            });

            if (onDeleteSuccess) {
              onDeleteSuccess();
            }
          },
        });
      })
      .catch(() => undefined);
  }, [
    disabled,
    confirm,
    categoryCount,
    categoryIds,
    removeCategory,
    toast,
    onDeleteSuccess,
  ]);

  if (children) {
    return (
      <Can action="productCategoriesManage">
        <>{children({ onClick: handleClick, disabled })}</>
      </Can>
    );
  }

  return (
    <Can action="productCategoriesManage">
      <Button
        variant="secondary"
        className="text-destructive"
        onClick={handleClick}
        disabled={disabled}
      >
        <IconTrash />
        Delete
      </Button>
    </Can>
  );
};
