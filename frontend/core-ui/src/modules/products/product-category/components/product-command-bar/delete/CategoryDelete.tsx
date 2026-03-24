import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useRemoveCategories } from '@/products/product-category/hooks/useRemoveCategories';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

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

  const confirmOptions = { confirmationValue: 'delete' };

  const categoryCount = categoryIds.includes(',')
    ? categoryIds.split(',').length
    : 1;

  const disabled = loading || !categoryIds?.trim();

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }

    confirm({
      message: `Are you sure you want to delete the ${categoryCount} selected categories?`,
      options: confirmOptions,
    })
      .then(() => {
        removeCategory(categoryIds, {
          onError: ({ errors }) => {
            const errorMessage =
              errors.length > 0
                ? errors.map((e) => e.message).join(', ')
                : 'Failed to delete categories';
            toast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            toast({
              title: 'Success',
              description: `${categoryCount} ${
                categoryCount === 1 ? 'category' : 'categories'
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
    confirmOptions,
    categoryCount,
    categoryIds,
    removeCategory,
    toast,
    onDeleteSuccess,
  ]);

  if (children) {
    return <>{children({ onClick: handleClick, disabled })}</>;
  }

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={handleClick}
      disabled={disabled}
    >
      <IconTrash />
      Delete
    </Button>
  );
};
