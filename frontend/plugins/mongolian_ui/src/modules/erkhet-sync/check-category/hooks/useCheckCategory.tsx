import { useMutation } from '@apollo/client';
import { checkCategoriesMutation } from '../graphql/mutations/checkCategoriesMutations';
import { useToast } from 'erxes-ui';
import { useAtom, atom } from 'jotai';
import { CategoryItem, CategoryStatus } from '../types/categoryItem';
import { ICheckCategory } from '../types/checkCategory';
import { useSyncCategory } from './useSyncCategory';

interface CheckCategoriesResponse {
  create?: { items: ICheckCategory[] };
  update?: { items: ICheckCategory[] };
  delete?: { items: ICheckCategory[] };
}

interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

const toCheckCategoriesAtom = atom<CategoryItem[] | null>(null);
const toCheckCategoriesDataAtom = atom<CheckCategoriesResponse | null>(null);
const selectedFilterAtom = atom<CategoryStatus>('create');

export const useCheckCategory = () => {
  const [toCheckCategories, setToCheckCategories] = useAtom(
    toCheckCategoriesAtom,
  );
  const [toCheckCategoriesData, setToCheckCategoriesData] = useAtom(
    toCheckCategoriesDataAtom,
  );
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);
  const [mutate, { loading, error }] = useMutation(checkCategoriesMutation);
  const {
    syncCategories: syncCategoriesAction,
    loading: syncLoading,
    error: syncError,
  } = useSyncCategory();

  const { toast } = useToast();

  const checkCategory = async () => {
    try {
      const response = await mutate({
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      });

      const responseData = response.data?.toCheckCategories;

      if (responseData) {
        const existingSyncedCategories =
          toCheckCategories?.filter((item) => item.isSynced === true) || [];

        const allCategories: CategoryItem[] = [
          ...existingSyncedCategories,
          ...(responseData.create?.items || []).map((item: ICheckCategory) => ({
            ...item,
            status: 'create' as const,
            isSynced: false,
          })),
          ...(responseData.update?.items || []).map((item: ICheckCategory) => ({
            ...item,
            status: 'update' as const,
            isSynced: false,
          })),
          ...(responseData.delete?.items || []).map((item: ICheckCategory) => ({
            ...item,
            status: 'delete' as const,
            isSynced: false,
          })),
        ];

        setToCheckCategoriesData(responseData);
        setToCheckCategories(allCategories);

        toast({
          title: 'Success',
          description: `${allCategories.length} categories found`,
        });
      }
    } catch (err) {
      console.error('Check category error:', err);
      toast({
        title: 'Error',
        description: 'Failed to check categories',
        variant: 'destructive',
      });
    }
  };

  const syncCategories = async () => {
    if (!toCheckCategories || toCheckCategories.length === 0) {
      toast({
        title: 'Warning',
        description: 'No categories to sync',
        variant: 'destructive',
      });
      return;
    }

    const updatedCategories = await syncCategoriesAction(
      toCheckCategories,
      selectedFilter,
    );

    if (updatedCategories) {
      setToCheckCategories(updatedCategories);
    }
  };

  const getFilteredCategories = (): CategoryItem[] => {
    if (!toCheckCategories) return [];
    return toCheckCategories.filter((item) => item.status === selectedFilter);
  };

  const pageInfo: PageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
  };

  return {
    toCheckCategories,
    toCheckCategoriesData,
    selectedFilter,
    setSelectedFilter,
    filteredCategories: getFilteredCategories(),
    checkCategory,
    syncCategories,
    loading,
    syncLoading,
    error,
    syncError,
    pageInfo,
  };
};
