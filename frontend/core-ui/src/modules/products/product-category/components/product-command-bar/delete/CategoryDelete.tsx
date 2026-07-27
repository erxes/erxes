import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useRemoveCategories } from '@/products/product-category/hooks/useRemoveCategories';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('product');
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
      message: t('category.confirm-delete-categories', {
        defaultValue:
          'Are you sure you want to delete the {{count}} selected category(ies)?',
        count: categoryCount,
      }),
      options: confirmOptions,
    })
      .then(() => {
        removeCategory(categoryIds, {
          onError: ({ errors }) => {
            const errorMessage =
              errors.length > 0
                ? errors.map((e) => e.message).join(', ')
                : t('category.failed-to-delete', 'Failed to delete categories');
            toast({
              title: t('category.error', 'Error'),
              description: errorMessage,
              variant: 'destructive',
            });
          },
          onCompleted: () => {
            toast({
              title: t('category.success', 'Success'),
              description: t('category.categories-deleted', {
                defaultValue: '{{count}} category(ies) deleted successfully.',
                count: categoryCount,
              }),
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
        {t('delete', 'Delete')}
      </Button>
    </Can>
  );
};
