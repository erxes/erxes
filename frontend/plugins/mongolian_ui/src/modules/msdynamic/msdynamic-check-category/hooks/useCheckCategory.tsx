import { useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useAtom, atom } from 'jotai';
import { useToast } from 'erxes-ui';

import { mutations } from '../../graphql';
import {
  CategoryFilterType,
  InventoryCategoryItems,
} from '../types/inventoryCategory';
import { useSyncCategory } from './useSyncCategory';

interface CheckCategoryMutationResponse {
  toCheckMsdProductCategories: InventoryCategoryItems;
}

const itemsAtom = atom<InventoryCategoryItems>({});
const loadingAtom = atom(false);
const selectedFilterAtom = atom<CategoryFilterType>('create');

/* Category check state, query param, sync action-uudiig neg hook bolgoj butsaana */
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

  /* Brand selector-iin utgiig URL query deer hadgalna */
  const setBrand = (brandId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('brandId', brandId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  /* Category selector-iin utgiig URL query deer hadgalna */
  const setCategory = (categoryId: string) => {
    const params = new URLSearchParams(location.search);
    params.set('categoryId', categoryId);
    navigate(`${location.pathname}?${params.toString()}`);
  };

  /* MS Dynamic bolon erxes category-uudiig haritsuulj check result avna */
  const toCheckCategory = async () => {
    const brandId = queryParams.brandId || 'noBrand';
    const categoryId = queryParams.categoryId || 'noCategory';

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

  /* Songogdson tab-iin category-uudiig sync hiigeed table state shinechilne */
  const toSyncCategory = async () => {
    const brandId = queryParams.brandId || 'noBrand';
    const rawCategoryId = queryParams.categoryId as string | undefined;
    const categoryId =
      rawCategoryId === 'noCategory' ? undefined : rawCategoryId;

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
