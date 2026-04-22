import { IProductCategory } from '@/products/types/productTypes';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useProductCategories } from '../hooks/useProductCategories';
import {
  IconHash,
  IconImageInPicture,
  IconLabelFilled,
  IconPackage,
} from '@tabler/icons-react';
import { useMemo, type MouseEvent } from 'react';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { categoryMoreColumn } from './ProductCategoryMoreColumn';
import { CategoryCommandBar } from './product-command-bar/CategoryCommandBar';
import { PRODUCTS_PER_PAGE } from '@/products/hooks/useProducts';
import { renderingCategoryDetailAtom } from '../states/ProductCategory';

export const ProductCategoriesRecordTable = () => {
  const { productCategories, loading } = useProductCategories();

  const categories = productCategories?.map((category: IProductCategory) => ({
    ...category,
    hasChildren: productCategories?.some(
      (c: IProductCategory) => c.parentId === category._id,
    ),
  }));

  const categoryObject = useMemo(() => {
    return categories?.reduce(
      (acc: Record<string, IProductCategory>, category: IProductCategory) => {
        acc[category._id] = category;
        return acc;
      },
      {},
    );
  }, [categories]);

  return (
    <RecordTable.Provider
      columns={productCategoryColumns(categoryObject)}
      data={categories || []}
      className="h-full"
    >
      <RecordTableTree id="product-categories" ordered>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList Row={RecordTableTree.Row} />
              {loading && <RecordTable.RowSkeleton rows={PRODUCTS_PER_PAGE} />}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
      <CategoryCommandBar />
    </RecordTable.Provider>
  );
};

export const productCategoryColumns: (
  categoryObject: Record<string, IProductCategory>,
) => ColumnDef<IProductCategory & { hasChildren: boolean }>[] = (
  categoryObject,
) => [
  categoryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<
    IProductCategory & { hasChildren: boolean }
  >,
  {
    id: 'attachment',
    header: () => <RecordTable.InlineHead icon={IconImageInPicture} label="" />,
    accessorKey: 'attachment',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="justify-center px-1">
          <Avatar>
            <Avatar.Image src={(cell.getValue() as any)?.url || ''} />
            <Avatar.Fallback>
              {cell.row.original.name.charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        </RecordTableInlineCell>
      );
    },
    size: 32,
  },
  {
    id: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label="Name" />
    ),
    accessorKey: 'name',
    cell: ProductCategoryNameCell,
    size: 300,
  },
  {
    id: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Code" />,
    accessorKey: 'code',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'productCount',
    header: () => (
      <RecordTable.InlineHead icon={IconPackage} label="Product Count" />
    ),
    accessorKey: 'productCount',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'parentId',
    header: () => <RecordTable.InlineHead icon={IconPackage} label="Parent" />,
    accessorKey: 'parentId',
    cell: ({ cell }) => {
      const parent = categoryObject[cell.getValue() as string];
      return <RecordTableInlineCell>{parent?.name}</RecordTableInlineCell>;
    },
  },
];

const ProductCategoryNameCell = ({
  cell,
}: CellContext<IProductCategory & { hasChildren: boolean }, unknown>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCategoryDetail = useSetAtom(renderingCategoryDetailAtom);
  const { _id, order, hasChildren } = cell.row.original;
  const name = (cell.getValue() as string) || '';

  const handleOpen = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category_id', _id);
    setSearchParams(newSearchParams);
    setRenderingCategoryDetail(false);
  };

  return (
    <RecordTableInlineCell>
      <RecordTableTree.Trigger
        order={order}
        name={name}
        hasChildren={hasChildren}
      >
        <Badge
          onClick={handleOpen}
          variant="secondary"
          className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
        >
          <TextOverflowTooltip value={name} />
        </Badge>
      </RecordTableTree.Trigger>
    </RecordTableInlineCell>
  );
};
