import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveCategories } from '@/products/product-category/hooks/useRemoveCategories';
import type { ReactNode } from 'react';

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

  const handleClick = () => {
    if (disabled) {
      return;
    }

    confirm({
      message: `Are you sure you want to delete the ${categoryCount} selected categories?`,
      options: confirmOptions,
    })
      .then(() => {
        removeCategory(categoryIds, {
          onError: (e: ApolloError) => {
            toast({
              title: 'Error',
              description: e.message,
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
  };

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
