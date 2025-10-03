import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useRemoveCategories } from '@/products/product-category/hooks/useRemoveCategories';

interface CategoriesDeleteProps {
  categoryIds: string;
  onDeleteSuccess?: () => void;
}

export const CategoriesDelete = ({
  categoryIds,
  onDeleteSuccess,
}: CategoriesDeleteProps) => {
  const { confirm } = useConfirm();
  const { removeCategory } = useRemoveCategories();
  const { toast } = useToast();

  const categoryCount = categoryIds.includes(',')
    ? categoryIds.split(',').length
    : 1;

  return (
    <Button
      variant="secondary"
      className="text-destructive"
      onClick={() =>
        confirm({
          message: `Are you sure you want to delete the ${categoryCount} selected categories?`,
        }).then(() => {
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
              });

              if (onDeleteSuccess) {
                onDeleteSuccess();
              }
            },
          });
        })
      }
    >
      <IconTrash />
      Delete
    </Button>
  );
};
