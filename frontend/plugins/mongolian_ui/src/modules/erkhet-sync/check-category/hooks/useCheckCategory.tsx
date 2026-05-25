import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { atom, useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { checkCategoriesMutation } from '../graphql/mutations/checkCategoriesMutations';
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

const EMPTY_PAGE_INFO: PageInfo = {
  hasPreviousPage: false,
  hasNextPage: false,
};

const toCheckCategoriesAtom = atom<CategoryItem[] | null>(null);
const toCheckCategoriesDataAtom = atom<CheckCategoriesResponse | null>(null);
const selectedFilterAtom = atom<CategoryStatus>('create');

const getCategoryKey = (item: { _id?: string; id?: string }) =>
  item._id ?? item.id;

const buildCategoryItems = (
  responseData: CheckCategoriesResponse,
  previousItems: CategoryItem[] | null,
): CategoryItem[] => {
  const previousSynced =
    previousItems?.filter((item) => item.isSynced === true) ?? [];

  const incoming = ([
    'create',
    'update',
    'delete',
  ] as const).flatMap<CategoryItem>((status) =>
    (responseData[status]?.items ?? []).map(
      (item: ICheckCategory) =>
        ({
          ...item,
          status,
          isSynced: false,
        }) as CategoryItem,
    ),
  );

  const incomingKeys = new Set(incoming.map(getCategoryKey).filter(Boolean));
  const carriedSynced = previousSynced.filter(
    (item) => !incomingKeys.has(getCategoryKey(item)),
  );

  return [...carriedSynced, ...incoming];
};

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

  const checkCategory = useCallback(async () => {
    try {
      const response = await mutate({
        onError: (mutationError) => {
          toast({
            title: 'Error',
            description: mutationError.message,
            variant: 'destructive',
          });
        },
      });

      const responseData: CheckCategoriesResponse | undefined =
        response.data?.toCheckCategories;

      if (!responseData) {
        return;
      }

      const allCategories = buildCategoryItems(responseData, toCheckCategories);

      setToCheckCategoriesData(responseData);
      setToCheckCategories(allCategories);

      const pendingCount = allCategories.filter(
        (item) => !item.isSynced,
      ).length;

      toast({
        title: pendingCount > 0 ? 'Success' : 'Up to date',
        description:
          pendingCount > 0
            ? `${pendingCount} categories to sync`
            : 'No categories require syncing',
      });
    } catch (err) {
      console.error('Check category error:', err);
      toast({
        title: 'Error',
        description: 'Failed to check categories',
        variant: 'destructive',
      });
    }
  }, [mutate, setToCheckCategories, setToCheckCategoriesData, toCheckCategories, toast]);

  const syncCategories = useCallback(async () => {
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
  }, [
    selectedFilter,
    setToCheckCategories,
    syncCategoriesAction,
    toCheckCategories,
    toast,
  ]);

  const filteredCategories = useMemo<CategoryItem[]>(
    () =>
      (toCheckCategories ?? []).filter(
        (item) => item.status === selectedFilter,
      ),
    [toCheckCategories, selectedFilter],
  );

  return {
    toCheckCategories,
    toCheckCategoriesData,
    selectedFilter,
    setSelectedFilter,
    filteredCategories,
    checkCategory,
    syncCategories,
    loading,
    syncLoading,
    error,
    syncError,
    pageInfo: EMPTY_PAGE_INFO,
  };
};
