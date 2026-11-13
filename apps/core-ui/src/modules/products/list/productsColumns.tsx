import type { Product } from '@erxes/core-contract';
import {
  IconArchive,
  IconBarcode,
  IconCategory,
  IconCurrencyDollar,
  IconEdit,
  IconLabelFilled,
  IconPhoto,
  IconPlug,
  IconRestore,
  IconTag,
} from '@tabler/icons-react';
import type { RecordTableColumnDef } from 'erxes-ui';
import { Badge, Combobox, Command, Popover, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMoney } from '~/lib/money';
import { useProductCategories } from '../categories/useProductCategories';
import { ProductAvatar } from '../panel/ProductPanelImages';
import { pluginTitle, useInstalledPlugins } from '../useCatalogContext';
import { useCanManageProducts, useOpenProduct, useProductStatus } from '../useProducts';

const MoreCell = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const { openProduct } = useOpenProduct();
  const { archive, restore } = useProductStatus();
  const manage = useCanManageProducts();
  const archived = product.status === 'archived';

  return (
    <Popover>
      <Popover.Trigger render={<RecordTable.MoreButton className="h-full w-full" />} />
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="open" onSelect={() => openProduct(product.id)}>
              <IconEdit /> {manage ? t('actions.edit', 'Edit') : t('actions.open', 'Open')}
            </Command.Item>
            {manage && (
              <Command.Item
                value="status"
                onSelect={() =>
                  archived ? restore.mutate({ id: product.id }) : archive.mutate({ id: product.id })
                }
              >
                {archived ? <IconRestore /> : <IconArchive />}
                {archived ? t('actions.restore', 'Restore') : t('actions.archive', 'Archive')}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const ImageCell = ({ product }: { product: Product }) => (
  <div className="flex h-8 items-center justify-center">
    <ProductAvatar product={product} className="size-6" />
  </div>
);

const NameCell = ({ product }: { product: Product }) => {
  const { openProduct } = useOpenProduct();

  return (
    <RecordTableInlineCell>
      <RecordTableInlineCell.Anchor onClick={() => openProduct(product.id)}>
        {product.name}
      </RecordTableInlineCell.Anchor>
    </RecordTableInlineCell>
  );
};

const TextCell = ({ children }: { children: React.ReactNode }) => (
  <RecordTableInlineCell className="text-sm">
    <span className="truncate">{children}</span>
  </RecordTableInlineCell>
);

const CategoryCell = ({ categoryId }: { categoryId: string | null }) => {
  const { tree } = useProductCategories();

  return <TextCell>{tree.find((node) => node.category.id === categoryId)?.path}</TextCell>;
};

const PriceCell = ({ product }: { product: Product }) => {
  const money = useMoney();

  return (
    <RecordTableInlineCell className="justify-end text-sm tabular-nums">
      {money(product.price, product.currency)}
    </RecordTableInlineCell>
  );
};

const PluginsCell = ({ names }: { names: string[] }) => {
  const { plugins } = useInstalledPlugins();

  return (
    <RecordTableInlineCell className="gap-1">
      {names.map((name) => (
        <Badge key={name} variant="secondary" className="shrink-0">
          {pluginTitle(plugins, name)}
        </Badge>
      ))}
    </RecordTableInlineCell>
  );
};

type Translate = (key: string, defaultValue: string) => string;

const createColumns = (t: Translate): RecordTableColumnDef<Product>[] => [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ({ row }) => <MoreCell product={row.original} />,
    size: 33,
  },
  {
    id: 'image',
    header: () => <RecordTable.InlineHead icon={IconPhoto} label="" />,
    cell: ({ row }) => <ImageCell product={row.original} />,
    size: 34,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label={t('fields.name', 'Name')} />
    ),
    cell: ({ row }) => <NameCell product={row.original} />,
    size: 260,
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconBarcode} label={t('fields.code', 'Code')} />,
    cell: ({ row }) => <TextCell>{row.original.code}</TextCell>,
    size: 140,
  },
  {
    id: 'category',
    accessorKey: 'categoryId',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('fields.category', 'Category')} />
    ),
    cell: ({ row }) => <CategoryCell categoryId={row.original.categoryId} />,
    size: 200,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('fields.kind', 'Kind')} />,
    cell: ({ row }) => (
      <TextCell>
        {row.original.kind === 'goods' ? t('kind.goods', 'Goods') : t('kind.service', 'Service')}
      </TextCell>
    ),
    size: 110,
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: () => (
      <RecordTable.InlineHead icon={IconCurrencyDollar} label={t('fields.price', 'Price')} />
    ),
    cell: ({ row }) => <PriceCell product={row.original} />,
    size: 140,
  },
  {
    id: 'plugins',
    accessorKey: 'plugins',
    header: () => <RecordTable.InlineHead icon={IconPlug} label={t('fields.plugins', 'Used by')} />,
    cell: ({ row }) => <PluginsCell names={row.original.plugins} />,
    size: 260,
  },
];

export const useProductsColumns = () => {
  const { t } = useTranslation('product');

  return useMemo(() => createColumns(t), [t]);
};
