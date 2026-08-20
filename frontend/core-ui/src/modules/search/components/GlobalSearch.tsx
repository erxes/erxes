import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { GlobalSearchDialog } from '@/search/components/GlobalSearchDialog';
import {
  GLOBAL_SEARCH_DEBOUNCE,
  GLOBAL_SEARCH_MIN_LENGTH,
} from '@/search/constants/globalSearch';
import { useGlobalSearch } from '@/search/hooks/useGlobalSearch';
import { useSettingsNavigationSearchItems } from '@/search/hooks/useSettingsNavigationSearchItems';
import { globalSearchOpenState } from '@/search/states/globalSearchState';
import {
  TGlobalSearchCategory,
  TGlobalSearchSortOrder,
} from '@/search/types/GlobalSearch';
import {
  getGlobalSearchCategoryShortcut,
  isGlobalSearchOpenShortcut,
} from '@/search/utils/globalSearchShortcuts';
import {
  buildGlobalSearchCategories,
  buildGlobalSearchSubcategories,
  getGlobalSearchTotalCount,
} from '@/search/utils/globalSearchResults';
import {
  buildNavigationSearchItems,
  filterNavigationSearchItems,
  getNavigationSearchCategoryCounts,
} from '@/search/utils/navigationSearch';
import { activePluginState } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

// Mounted by the layout so the sidebar trigger and shortcut keep one search
// instance available across navigation changes.
export const GlobalSearch = () => {
  const navigate = useNavigate();
  const activities = useNavigationActivities();
  const settingsItems = useSettingsNavigationSearchItems();
  const setActiveActivityId = useSetAtom(activePluginState);
  const [open, setOpen] = useAtom(globalSearchOpenState);
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<TGlobalSearchCategory>('all');
  const [subcategory, setSubcategory] = useState('all');
  const [sortOrder, setSortOrder] =
    useState<TGlobalSearchSortOrder>('newest');
  const searchValue = value.trim();
  const [debouncedValue] = useDebounce(searchValue, GLOBAL_SEARCH_DEBOUNCE);
  const { groups, loading, hasFailure, refetch, loadMore } =
    useGlobalSearch(debouncedValue, sortOrder);

  const { goToItems, pluginItems } = useMemo(
    () => buildNavigationSearchItems(activities, settingsItems),
    [activities, settingsItems],
  );
  const matchingGoToItems = useMemo(
    () => filterNavigationSearchItems(goToItems, searchValue),
    [goToItems, searchValue],
  );
  const navigationCounts = useMemo(
    () => getNavigationSearchCategoryCounts(matchingGoToItems),
    [matchingGoToItems],
  );
  const contentSearchReady = searchValue.length >= GLOBAL_SEARCH_MIN_LENGTH;
  const contentSearchSettled =
    contentSearchReady && debouncedValue === searchValue;
  const visibleGroups = contentSearchSettled ? groups : [];
  const categories = useMemo(
    () =>
      buildGlobalSearchCategories({
        hasSearchValue: searchValue.length > 0,
        navigationCounts,
        groups: visibleGroups,
      }),
    [navigationCounts, searchValue.length, visibleGroups],
  );
  const categoryKeys = useMemo(
    () => categories.map(({ key }) => key),
    [categories],
  );
  const subcategories = useMemo(
    () => buildGlobalSearchSubcategories(category, visibleGroups),
    [category, visibleGroups],
  );
  const contentLoading =
    contentSearchReady && (!contentSearchSettled || loading);
  const contentFailure = contentSearchSettled && hasFailure;
  const totalCount = getGlobalSearchTotalCount({
    category: 'all',
    navigationCounts,
    groups: visibleGroups,
  });

  const resetSearch = () => {
    setValue('');
    setCategory('all');
    setSubcategory('all');
  };

  useEffect(() => {
    if (
      !loading &&
      (!contentSearchReady || contentSearchSettled) &&
      !categoryKeys.includes(category)
    ) {
      setCategory('all');
    }
  }, [
    category,
    categoryKeys,
    contentSearchReady,
    contentSearchSettled,
    loading,
  ]);

  useEffect(() => {
    if (
      !loading &&
      !subcategories.some(({ key }) => key === subcategory)
    ) {
      setSubcategory('all');
    }
  }, [loading, subcategory, subcategories]);

  const handleCategoryChange = (nextCategory: TGlobalSearchCategory) => {
    setCategory(nextCategory);
    setSubcategory('all');
  };

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (open) {
        const nextCategory = getGlobalSearchCategoryShortcut(
          event,
          categoryKeys,
          category,
        );

        if (nextCategory) {
          event.preventDefault();
          setCategory(nextCategory);

          return;
        }
      }

      if (isGlobalSearchOpenShortcut(event)) {
        event.preventDefault();

        if (!event.repeat) {
          setOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleSearchShortcut);

    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [category, categoryKeys, open, setOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetSearch();
    }
  };

  const openResult = (path: string) => {
    resetSearch();
    setOpen(false);
    navigate(path);
  };

  const openNavigationResult = (path: string, activityId?: string) => {
    if (activityId) {
      setActiveActivityId(activityId);
    }

    openResult(path);
  };

  return (
    <GlobalSearchDialog
      category={category}
      categories={categories}
      subcategory={subcategory}
      subcategories={subcategories}
      sortOrder={sortOrder}
      contentFailure={contentFailure}
      contentLoading={contentLoading}
      contentSearchReady={contentSearchReady}
      goToItems={matchingGoToItems}
      groups={visibleGroups}
      open={open}
      quickAccessItems={pluginItems}
      totalCount={totalCount}
      value={value}
      onCategoryChange={handleCategoryChange}
      onClear={resetSearch}
      onContentSelect={openResult}
      onLoadMore={loadMore}
      onNavigationSelect={openNavigationResult}
      onOpenChange={handleOpenChange}
      onRetry={() => refetch()}
      onSubcategoryChange={setSubcategory}
      onSortOrderChange={setSortOrder}
      onValueChange={setValue}
    />
  );
};
