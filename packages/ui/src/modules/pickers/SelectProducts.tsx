import { IconFolder, IconPackage } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { Combobox } from 'erxes-ui/components/combobox';
import type {
  ProductCategoryChoice,
  ProductQueries,
  ProductRecord,
} from 'erxes-ui/modules/records/products';
import { treeRows } from 'erxes-ui/modules/tree/treeRows';
import { useRowsById } from './rowsById';
import { pickerFamily } from './selectFamilyParts';

/** Where the product pickers read core's catalog. */
export interface ProductSource {
  /** `productQueries` from `@erxes/core-contract/client`. */
  products: ProductQueries;
}

/** Core products by id. */
const useProductsById = (products: ProductQueries, ids: string[]) =>
  useRowsById(products.byIds, ids);

/** A product's code in a small mono chip, then its name, as 3.x drew one. */
const ProductLabel = ({ item, more = 0 }: { item: ProductRecord; more?: number }) => {
  const { t } = useTranslation('ui', { keyPrefix: 'product' });

  const name = more
    ? t('more', '{{name}} +{{count}} more', { name: item.name, count: more })
    : item.name;

  if (!item.code) return <span className="truncate">{name}</span>;

  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 rounded border bg-muted px-1 font-mono text-xs text-muted-foreground">
        {item.code}
      </span>
      <span className="truncate">{name}</span>
    </span>
  );
};

/**
 * Picks core products in a table cell, a form field or a filter.
 * 3.x's `SelectProduct`. Each takes `products` (`productQueries` from `@erxes/core-contract/client`), `value` and
 * `onValueChange`; `mode="multiple"` picks several. It searches the catalog as you type.
 */
export const SelectProduct = pickerFamily<ProductSource, ProductRecord>({
  name: 'select-product',
  icon: IconPackage,
  useById: ({ products }, ids) => useProductsById(products, ids),
  useList: ({ products }, search) => {
    const [term] = useDebounce(search, 500);
    const query = useQuery(products.page({ search: term || undefined }));

    return { items: query.data?.data ?? [], loading: query.isPending, error: query.error };
  },
  serverSearch: true,
  itemKey: (product) => ({ id: product.id, label: `${product.code ?? ''} ${product.name}` }),
  Item: ProductLabel,
  useTexts: () => {
    const { t } = useTranslation('ui', { keyPrefix: 'product' });

    return {
      search: t('search', 'Search products'),
      placeholder: t('select', 'Select Products'),
      count: (count) => t('selected', '{{count}} products', { count }),
    };
  },
});

/** Core's product categories as a tree in reading order, siblings by name. */
const useCategories = (products: ProductQueries) => {
  const query = useQuery(products.categories);
  const list = query.data?.data;
  const rows = useMemo(() => treeRows(list ?? [], (category) => category.name), [list]);

  return { rows, loading: query.isPending, error: query.error };
};

const CategoryLabel = ({ item }: { item: ProductCategoryChoice }) => (
  <span className="truncate font-medium">{item.name}</span>
);

/**
 * Picks core's product categories from a tree that folds.
 * 3.x's `SelectCategory`: a table cell, a form field and filter parts; each takes `products` (`productQueries`),
 * `value` and `onValueChange`.
 */
export const SelectCategory = pickerFamily<
  ProductSource,
  ReturnType<typeof useCategories>['rows'][number]
>({
  name: 'select-category',
  icon: IconFolder,
  useById: ({ products }) => {
    const { rows, loading } = useCategories(products);

    return { byId: new Map(rows.map((row) => [row.id, row])), loading };
  },
  useList: ({ products }) => {
    const { rows, loading, error } = useCategories(products);

    return { items: rows, loading, error };
  },
  itemKey: (category) => ({ id: category.id, label: category.name }),
  Item: CategoryLabel,
  treeOf: (category) => category,
  useTexts: () => {
    const { t } = useTranslation('ui', { keyPrefix: 'category' });

    return {
      search: t('search', 'Search categories'),
      placeholder: t('select', 'Choose category'),
      count: (count) => t('selected', '{{count}} categories', { count }),
    };
  },
});

/**
 * Products by id: the first one's code and name, "+N more" after it.
 * Pass `products` when the page has the rows; else they are read by `productIds`.
 */
export const ProductsInline = ({
  productIds,
  products,
  productQueries,
  placeholder,
  className,
}: {
  productIds?: string[];
  products?: ProductRecord[];
  /** `productQueries` from `@erxes/core-contract/client`, to read the ones not in `products`. */
  productQueries: ProductQueries;
  placeholder?: string;
  className?: string;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'product' });
  const ids = productIds ?? products?.map((product) => product.id) ?? [];
  const missing = ids.filter((id) => !products?.some((product) => product.id === id));
  const { byId, loading } = useProductsById(productQueries, missing);
  const first = products?.find((product) => product.id === ids[0]) ?? byId.get(ids[0] ?? '');

  return (
    <Combobox.Value
      value={first && <ProductLabel item={first} more={ids.length - 1} />}
      loading={loading}
      placeholder={placeholder ?? t('select', 'Select Products')}
      className={className}
    />
  );
};
