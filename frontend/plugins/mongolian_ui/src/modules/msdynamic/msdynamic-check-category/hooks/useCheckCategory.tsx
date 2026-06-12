import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useAtom, atom } from 'jotai';
import { useToast } from 'erxes-ui';

import { mutations } from '../../graphql';
import { CategoryFilterType } from '../types/inventoryCategory';
import { InventoryCategoryItems } from '../types/inventoryCategory';
import { useSyncCategory } from './useSyncCategory';

interface CheckCategoryMutationResponse {
  toCheckMsdProductCategories: InventoryCategoryItems;
}

const itemsAtom = atom<InventoryCategoryItems>({});
const loadingAtom = atom(false);
const selectedFilterAtom = atom<CategoryFilterType>('create');

export const useCheckCategory = () => {
  const [items, setItems] = useAtom(itemsAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { syncCategories: syncCategoriesAction, loading: syncLoading } =
    useSyncCategory();

  const queryParams = Object.fromEntries(new URLSearchParams(location.search));

  const [toCheckMsdProductCategories] =
    useMutation<CheckCategoryMutationResponse>(
      gql(mutations.toCheckCategories),
    );

  const setBrand = (brandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('brandId', brandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const setCategory = (categoryId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('categoryId', categoryId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const toCheckCategory = async () => {
    const brandId = (queryParams.brandId as string) || 'noBrand';
    const categoryId = (queryParams.categoryId as string) || 'noCategory';

    try {
      setLoading(true);

      const response = await toCheckMsdProductCategories({
        variables: { brandId, categoryId },
      });

      const responseData = response.data?.toCheckMsdProductCategories;

      if (responseData) {
        const nextItems = {
          create: {
            items: (responseData.create?.items || []).map((item) => ({
              ...item,
              syncStatus: false,
            })),
          },
          update: {
            items: (responseData.update?.items || []).map((item) => ({
              ...item,
              syncStatus: false,
            })),
          },
          delete: {
            items: (responseData.delete?.items || []).map((item) => ({
              ...item,
              syncStatus: false,
            })),
          },
        };

        setItems(nextItems);

        toast({
          title: 'Success',
          description: 'MS Dynamic categories checked successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to check MS Dynamic categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toSyncCategory = async () => {
    const brandId = (queryParams.brandId as string) || 'noBrand';
    const categoryId = (queryParams.categoryId as string) || 'noCategory';

    const updatedItems = await syncCategoriesAction(
      items,
      selectedFilter,
      brandId,
      categoryId,
    );

    if (updatedItems) {
      setItems(updatedItems);
    }
  };

  return {
    items,
    loading: loading || syncLoading,
    selectedFilter,
    setSelectedFilter,
    queryParams,
    setBrand,
    setCategory,
    toCheckCategory,
    toSyncCategory,
  };
};
