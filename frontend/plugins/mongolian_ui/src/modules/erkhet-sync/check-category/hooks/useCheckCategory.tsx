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
export const syncedCategoryCodesAtom = atom<Set<string>>(new Set<string>());

const buildCategoryItems = (
  responseData: CheckCategoriesResponse,
): CategoryItem[] =>
  (['create', 'update', 'delete'] as const).flatMap<CategoryItem>((status) =>
    (responseData[status]?.items ?? []).map(
      (item: ICheckCategory) => ({ ...item, status } as CategoryItem),
    ),
  );

export const useCheckCategory = () => {
  const [toCheckCategories, setToCheckCategories] = useAtom(
    toCheckCategoriesAtom,
  );
  const [toCheckCategoriesData, setToCheckCategoriesData] = useAtom(
    toCheckCategoriesDataAtom,
  );
  const [selectedFilter, setSelectedFilter] = useAtom(selectedFilterAtom);
  const [syncedCodes, setSyncedCodes] = useAtom(syncedCategoryCodesAtom);
  const [mutate, { loading, error }] = useMutation(checkCategoriesMutation);
  const {
    syncCategories: syncCategoriesAction,
    loading: syncLoading,
    error: syncError,
  } = useSyncCategory();

  const { toast } = useToast();

  const runCheck = useCallback(
    async (silent = false): Promise<CategoryItem[] | null> => {
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
          return null;
        }

        const allCategories = buildCategoryItems(responseData);

        setToCheckCategoriesData(responseData);
        setToCheckCategories(allCategories);
        setSyncedCodes(new Set<string>());

        if (!silent) {
          const pendingCount = allCategories.length;
          toast({
            title: pendingCount > 0 ? 'Success' : 'Up to date',
            description:
              pendingCount > 0
                ? `${pendingCount} categories to sync`
                : 'No categories require syncing',
          });
        }

        return allCategories;
      } catch (err) {
        console.error('Check category error:', err);
        toast({
          title: 'Error',
          description: 'Failed to check categories',
          variant: 'destructive',
        });
        return null;
      }
    },
    [mutate, setToCheckCategories, setToCheckCategoriesData, toast],
  );

  const checkCategory = useCallback(() => runCheck(false), [runCheck]);

  const syncCategories = useCallback(async () => {
    if (!toCheckCategories || toCheckCategories.length === 0) {
      toast({
        title: 'Warning',
        description: 'No categories to sync',
        variant: 'destructive',
      });
      return;
    }

    const categoriesToSync = toCheckCategories.filter(
      (item) => item.status === selectedFilter,
    );

    const syncResult = await syncCategoriesAction(
      toCheckCategories,
      selectedFilter,
    );

    if (syncResult) {
      setSyncedCodes(new Set(categoriesToSync.map((item) => item.code)));
      await runCheck(true);
    }
  }, [
    runCheck,
    selectedFilter,
    syncCategoriesAction,
    toCheckCategories,
    toast,
  ]);

  const filteredCategories = useMemo<CategoryItem[]>(
    () =>
      (toCheckCategories ?? [])
        .filter((item) => item.status === selectedFilter)
        .map((item) =>
          syncedCodes.has(item.code)
            ? { ...item, status: 'synced' as CategoryStatus }
            : item,
        ),
    [toCheckCategories, selectedFilter, syncedCodes],
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
