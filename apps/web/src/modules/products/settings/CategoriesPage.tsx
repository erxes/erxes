import type { ProductCategory } from '@erxes/core-contract';
import {
  IconCategory,
  IconDots,
  IconEdit,
  IconFolder,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Button,
  DropdownMenu,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { isApiError, messageOf } from '~/lib/api';
import type { CategoryNode } from '../categories/categoryTree';
import { useCategoryMutations, useProductCategories } from '../categories/useProductCategories';
import { PRODUCT_SETTINGS } from '../paths';
import { useCanManageProducts } from '../useProducts';
import { CategoryDialog, type CategoryDialogTarget } from './CategoryDialog';

/** Deletes after asking; a category with subcategories says to move them first. */
const useRemoveCategory = () => {
  const { t } = useTranslation('product');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { remove } = useCategoryMutations();

  return (category: ProductCategory) =>
    void confirm({
      message: t('category.remove-confirm', 'Delete the category “{{name}}”?', {
        name: category.name,
      }),
      options: {
        description: t(
          'category.remove-description',
          'Its products keep existing without a category.',
        ),
        okLabel: t('actions.delete', 'Delete'),
        cancelLabel: t('actions.cancel', 'Cancel'),
        variants: { ok: 'destructive' },
      },
    }).then(() =>
      remove.mutate(
        { id: category.id },
        {
          onError: (error) =>
            toast({
              variant: 'destructive',
              title: t('category.remove-failed', 'Could not delete the category'),
              description: isApiError(error, 'CATEGORY_HAS_CHILDREN')
                ? t('errors.category-has-children', 'Move or delete its subcategories first.')
                : messageOf(error),
            }),
        },
      ),
    );
};

const CategoryRow = ({
  node,
  manage,
  onOpen,
}: {
  node: CategoryNode;
  manage: boolean;
  onOpen: (target: CategoryDialogTarget) => void;
}) => {
  const { t } = useTranslation('product');
  const removeCategory = useRemoveCategory();
  const { category } = node;

  return (
    <li className="flex h-10 items-center gap-2 px-3 text-sm hover:bg-muted/50">
      <span
        className="flex min-w-0 flex-1 items-center gap-2 pl-(--indent)"
        style={{ '--indent': `${node.depth * 1.25}rem` }}
      >
        <IconFolder className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{category.name}</span>
      </span>
      {manage && (
        <DropdownMenu>
          <DropdownMenu.Trigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('category.actions', 'Category actions')}
              />
            }
          >
            <IconDots />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item onClick={() => onOpen({ mode: 'add', parentId: category.id })}>
              <IconPlus /> {t('category.add-sub', 'Add subcategory')}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => onOpen({ mode: 'edit', category })}>
              <IconEdit /> {t('category.edit', 'Rename or move category')}
            </DropdownMenu.Item>
            <DropdownMenu.Item variant="destructive" onClick={() => removeCategory(category)}>
              <IconTrash /> {t('actions.delete', 'Delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </li>
  );
};

/** Products › Settings › Categories: the category tree. */
export const CategoriesPage = () => {
  const { t } = useTranslation('product');
  const manage = useCanManageProducts();
  const { query, tree } = useProductCategories();
  const [target, setTarget] = useState<CategoryDialogTarget | null>(null);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('settings.categories', 'Categories'),
                to: PRODUCT_SETTINGS.categories,
                icon: IconCategory,
              },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {manage && (
            <Button onClick={() => setTarget({ mode: 'add', parentId: null })}>
              <IconPlus />
              {t('category.add', 'Add category')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-auto">
        <QueryState
          query={query}
          isEmpty={(data) => data.data.length === 0}
          empty={
            <Empty>
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconCategory />
                </Empty.Media>
                <Empty.Title>{t('category.empty-title', 'No categories yet')}</Empty.Title>
                <Empty.Description>
                  {t(
                    'category.empty-description',
                    'Categories group products, like Drinks › Coffee. Every app sees the same ones.',
                  )}
                </Empty.Description>
              </Empty.Header>
            </Empty>
          }
        >
          {() => (
            <ul className="m-3 divide-y rounded-lg border">
              {tree.map((node) => (
                <CategoryRow
                  key={node.category.id}
                  node={node}
                  manage={manage}
                  onOpen={setTarget}
                />
              ))}
            </ul>
          )}
        </QueryState>
      </ScrollArea>
      <CategoryDialog target={target} onClose={() => setTarget(null)} />
    </PageContainer>
  );
};
