import { Button, useConfirm, useToast } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useRemoveCategories } from '@/products/product-category/hooks/useRemoveCategories';
import type { IProductCategory } from '@/products/types/productTypes';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useLazyQuery } from '@apollo/client';
import { PRODUCT_CATEGORY_DELETE_PREFLIGHT } from './queries';

const CONFIRM_OPTIONS = { confirmationValue: 'delete' };

interface CategoryDeletePreflightItem {
  _id: string;
  name?: string;
  parentId?: string;
  productCount?: number;
}

interface CategoryDeletePreflightData {
  selectedDefault: CategoryDeletePreflightItem[];
  selectedDisabled: CategoryDeletePreflightItem[];
  selectedArchived: CategoryDeletePreflightItem[];
  activeDescendants: CategoryDeletePreflightItem[];
  disabledCategories: CategoryDeletePreflightItem[];
  archivedCategories: CategoryDeletePreflightItem[];
}

interface CategoryDeletePreflightVariables {
  ids: string[];
}

interface CategoriesDeleteProps {
  categories: IProductCategory[];
  onDeleteSuccess?: () => void;
  children?: (args: { onClick: () => void; disabled: boolean }) => ReactNode;
}

export const CategoriesDelete = ({
  categories,
  onDeleteSuccess,
  children,
}: CategoriesDeleteProps) => {
  const { confirm } = useConfirm();
  const { removeCategory, loading } = useRemoveCategories();
  const { toast } = useToast();
  const { t } = useTranslation('product', {
    keyPrefix: 'category-delete',
  });
  const [checkCategories, { loading: checkingCategories }] = useLazyQuery<
    CategoryDeletePreflightData,
    CategoryDeletePreflightVariables
  >(PRODUCT_CATEGORY_DELETE_PREFLIGHT, {
    fetchPolicy: 'network-only',
  });

  const categoryIds = useMemo(
    () => [...new Set(categories.map((category) => category._id))],
    [categories],
  );
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category._id, category.name])),
    [categories],
  );
  const categoryCount = categoryIds.length;

  const disabled = loading || checkingCategories || categoryCount === 0;

  const handleClick = useCallback(async () => {
    if (disabled) {
      return;
    }

    let preflightData: CategoryDeletePreflightData;

    try {
      const { data } = await checkCategories({
        variables: { ids: categoryIds },
      });

      if (!data) {
        throw new Error('Category delete preflight returned no data');
      }

      preflightData = data;
    } catch {
      toast({
        title: t('check-failed-title', {
          defaultValue: 'Unable to check categories',
        }),
        description: t('check-failed-description', {
          defaultValue:
            'Category dependencies could not be checked. Please try again.',
        }),
        variant: 'destructive',
      });
      return;
    }

    const selectedCategories = [
      ...preflightData.selectedDefault,
      ...preflightData.selectedDisabled,
      ...preflightData.selectedArchived,
    ];
    const selectedCategoryById = new Map(
      selectedCategories.map((category) => [category._id, category]),
    );

    if (selectedCategoryById.size !== categoryCount) {
      toast({
        title: t('check-failed-title', {
          defaultValue: 'Unable to check categories',
        }),
        description: t('check-failed-description', {
          defaultValue:
            'Category dependencies could not be checked. Please try again.',
        }),
        variant: 'destructive',
      });
      return;
    }

    const parentIds = new Set(
      [
        ...preflightData.activeDescendants,
        ...preflightData.disabledCategories,
        ...preflightData.archivedCategories,
      ].flatMap((category) => (category.parentId ? [category.parentId] : [])),
    );
    const blockedCategoryIds = new Set(
      categoryIds.filter((categoryId) => {
        const category = selectedCategoryById.get(categoryId);

        return Boolean(
          (category?.productCount && category.productCount > 0) ||
          parentIds.has(categoryId),
        );
      }),
    );
    const blockedCategoryNames = categoryIds
      .filter((categoryId) => blockedCategoryIds.has(categoryId))
      .map(
        (categoryId) =>
          selectedCategoryById.get(categoryId)?.name ||
          categoryNames.get(categoryId) ||
          categoryId,
      )
      .join(', ');
    const deletableCategoryIds = categoryIds.filter(
      (categoryId) => !blockedCategoryIds.has(categoryId),
    );
    const deletableCategoryCount = deletableCategoryIds.length;

    if (blockedCategoryNames) {
      const hasDeletableCategories = deletableCategoryCount > 0;

      toast({
        title: hasDeletableCategories
          ? t('skipped-title', {
              defaultValue: 'Some categories will be skipped',
            })
          : t('blocked-title', {
              defaultValue: 'Categories cannot be deleted',
            }),
        description: hasDeletableCategories
          ? t('skipped-description', {
              categories: blockedCategoryNames,
              defaultValue:
                'The following categories contain products or sub-categories and will not be deleted: {{categories}}. Empty selected categories can still be deleted.',
            })
          : t('blocked-description', {
              categories: blockedCategoryNames,
              defaultValue:
                'The following categories contain products or sub-categories and cannot be deleted: {{categories}}. Move or delete their contents first.',
            }),
        variant: 'warning',
      });

      if (!hasDeletableCategories) {
        return;
      }
    }

    confirm({
      message:
        categoryCount === 1
          ? 'Are you sure you want to delete this category?'
          : `Are you sure you want to delete the ${deletableCategoryCount} empty ${
              deletableCategoryCount === 1 ? 'category' : 'categories'
            }?`,
      options: CONFIRM_OPTIONS,
    })
      .then(() => {
        removeCategory(deletableCategoryIds, {
          onError: ({ succeededIds, errors }) => {
            const failedCount = deletableCategoryCount - succeededIds.length;
            const failureReason =
              failedCount === 1
                ? errors[0]?.message || 'Failed to delete category.'
                : errors.map(({ message }) => message).join(' ') ||
                  'Failed to delete categories.';
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
    categoryNames,
    checkCategories,
    removeCategory,
    toast,
    t,
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
