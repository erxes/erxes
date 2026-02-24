import { CellContext } from '@tanstack/react-table';
import { IProductCategory } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { renderingCategoryDetailAtom } from '../states/ProductCategory';

export const CategoryMoreColumnCell = (
  props: CellContext<IProductCategory & { hasChildren: boolean }, unknown>,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCategoryDetail = useSetAtom(renderingCategoryDetailAtom);
  const { _id } = props.row.original;

  const setOpen = (categoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category_id', categoryId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingCategoryDetail(false);
      }}
    />
  );
};

export const categoryMoreColumn = {
  id: 'more',
  cell: CategoryMoreColumnCell,
  size: 33,
} as const;
