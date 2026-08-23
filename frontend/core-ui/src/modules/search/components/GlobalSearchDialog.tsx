import { IconX } from '@tabler/icons-react';
import { Button, Command, Dialog, Kbd, Select, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import {
  GlobalSearchPluginsGroup,
  NavigationSearchGroup,
} from '@/search/components/GlobalSearchGroup';
import {
  GlobalSearchEmpty,
  GlobalSearchFailure,
  GlobalSearchLoading,
  GlobalSearchMinimumLength,
} from '@/search/components/GlobalSearchStates';
import { GLOBAL_SEARCH_PREVIEW_LIMIT } from '@/search/constants/globalSearch';
import { NAVIGATION_SEARCH_CATEGORIES } from '@/search/utils/globalSearchResults';
import {
  TGlobalSearchCategory,
  TGlobalSearchCategoryOption,
  TGlobalSearchGroup,
  TGlobalSearchSortOrder,
  TGlobalSearchSubcategoryOption,
  TNavigationSearchItem,
} from '@/search/types/GlobalSearch';

const CONTENT_CATEGORIES = new Set(
  NAVIGATION_SEARCH_CATEGORIES.map(({ key }) => key as string),
);

const SearchCategoryLabel = ({
  category,
}: {
  category: TGlobalSearchCategoryOption;
}) => {
  const { t } = useTranslation(category.labelNamespace ?? 'common', {
    keyPrefix: category.labelNamespace ? undefined : 'global-search',
  });

  return <>{t(category.labelKey ?? category.key, category.label)}</>;
};

const previewCount = (count: number, isAll: boolean): number =>
  isAll ? Math.min(count, GLOBAL_SEARCH_PREVIEW_LIMIT) : count;

const showMoreHandler = (
  condition: boolean,
  target: TGlobalSearchCategory,
  onCategoryChange: (category: TGlobalSearchCategory) => void,
): (() => void) | undefined =>
  condition ? () => onCategoryChange(target) : undefined;

const getResultsState = (
  category: TGlobalSearchCategory,
  subcategory: string,
  groups: TGlobalSearchGroup[],
  goToItems: TNavigationSearchItem[],
  contentSearchReady: boolean,
  contentLoading: boolean,
  contentFailure: boolean,
) => {
  const visibleGroups = groups.filter(
    (group) => group.status === 'ok' && group.items.length > 0,
  );
  const isAll = category === 'all';
  const isNavCategory = category === 'navigation';
  const isContentCategory = CONTENT_CATEGORIES.has(category);
  const contentScopeActive = isAll || isContentCategory;
  const scopedContentGroups = visibleGroups.filter(
    (group) =>
      (isAll || group.category === category) &&
      (subcategory === 'all' || group.subcategory === subcategory),
  );
  const pluginGroups = scopedContentGroups.filter(
    (group) => group.category === 'plugins',
  );
  const otherContentGroups = scopedContentGroups.filter(
    (group) => group.category !== 'plugins',
  );
  const pluginItemCount = pluginGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );
  const otherItemCount = otherContentGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );
  const navigationItems = isNavCategory || isAll ? goToItems : [];
  const visibleItemCount =
    navigationItems.length +
    previewCount(pluginItemCount, isAll) +
    previewCount(otherItemCount, isAll);
  const inContentEmptyScope = visibleItemCount === 0 && contentScopeActive;
  const waitingForContent =
    contentSearchReady && contentLoading && contentScopeActive;
  const needsMoreCharacters = !contentSearchReady && inContentEmptyScope;
  const showFailure = contentFailure && inContentEmptyScope;
  const showEmpty =
    visibleItemCount === 0 &&
    !waitingForContent &&
    !needsMoreCharacters &&
    !showFailure;

  return {
    isAll,
    pluginGroups,
    pluginItemCount,
    otherContentGroups,
    navigationItems,
    visibleItemCount,
    waitingForContent,
    needsMoreCharacters,
    showFailure,
    showEmpty,
  };
};

const GlobalSearchResults = ({
  category,
  subcategory,
  searchValue,
  contentSearchReady,
  contentLoading,
  contentFailure,
  groups,
  goToItems,
  quickAccessItems,
  onCategoryChange,
  onContentSelect,
  onNavigationSelect,
  onLoadMore,
  onRetry,
  sortOrder,
}: {
  category: TGlobalSearchCategory;
  subcategory: string;
  searchValue: string;
  contentSearchReady: boolean;
  contentLoading: boolean;
  contentFailure: boolean;
  groups: TGlobalSearchGroup[];
  goToItems: TNavigationSearchItem[];
  quickAccessItems: TNavigationSearchItem[];
  onCategoryChange: (category: TGlobalSearchCategory) => void;
  onContentSelect: (path: string) => void;
  onNavigationSelect: (path: string, activityId?: string) => void;
  onLoadMore: (providerKey: string) => void;
  onRetry: () => void;
  sortOrder: TGlobalSearchSortOrder;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const isSearching = searchValue.length > 0;

  if (!isSearching) {
    return (
      <Command.List
        key={category}
        className="styled-scroll m-0 min-h-32 max-h-[min(70vh,36rem)] p-1"
      >
        <NavigationSearchGroup
          actionLabel={t('open-plugin', 'Open plugin')}
          heading={t('quick-access', 'Quick access')}
          items={quickAccessItems}
          searchValue=""
          onSelect={onNavigationSelect}
        />
        {quickAccessItems.length === 0 && <GlobalSearchEmpty />}
      </Command.List>
    );
  }

  const {
    isAll,
    pluginGroups,
    pluginItemCount,
    otherContentGroups,
    navigationItems,
    visibleItemCount,
    waitingForContent,
    needsMoreCharacters,
    showFailure,
    showEmpty,
  } = getResultsState(
    category,
    subcategory,
    groups,
    goToItems,
    contentSearchReady,
    contentLoading,
    contentFailure,
  );
  const otherCategoryGroups = [
    ...new Set(otherContentGroups.map((group) => group.category)),
  ].map((groupCategory) => ({
    category: groupCategory,
    groups: otherContentGroups.filter(
      (group) => group.category === groupCategory,
    ),
  }));
  const pluginHasMore = pluginGroups.some(
    (group) =>
      group.pageInfo.hasNextPage ||
      group.totalCount > GLOBAL_SEARCH_PREVIEW_LIMIT,
  );

  return (
    <Command.List
      key={category}
      className="styled-scroll m-0 min-h-32 max-h-[min(70vh,36rem)] p-1"
    >
      {navigationItems.length > 0 && (
        <NavigationSearchGroup
          actionLabel={t('go-to-page', 'Go to page')}
          heading={t('navigation', 'Navigation')}
          items={navigationItems}
          previewLimit={isAll ? GLOBAL_SEARCH_PREVIEW_LIMIT : undefined}
          searchValue={searchValue}
          onSelect={onNavigationSelect}
          onShowMore={showMoreHandler(
            isAll && navigationItems.length > GLOBAL_SEARCH_PREVIEW_LIMIT,
            'navigation',
            onCategoryChange,
          )}
        />
      )}

      {pluginGroups.length > 0 && (
        <GlobalSearchPluginsGroup
          actionLabel={t('open-result', 'Open result')}
          groups={pluginGroups}
          heading={
            subcategory === 'all'
              ? t('plugins', 'Plugins')
              : pluginGroups[0]?.subcategoryLabel
          }
          previewLimit={isAll ? GLOBAL_SEARCH_PREVIEW_LIMIT : undefined}
          searchValue={searchValue}
          sortOrder={sortOrder}
          onLoadMore={isAll ? undefined : onLoadMore}
          onSelect={onContentSelect}
          onShowMore={showMoreHandler(
            isAll &&
              (pluginItemCount > GLOBAL_SEARCH_PREVIEW_LIMIT || pluginHasMore),
            'plugins',
            onCategoryChange,
          )}
        />
      )}

      {otherCategoryGroups.map(
        ({ category: groupCategory, groups: categoryGroups }) => {
          const itemCount = categoryGroups.reduce(
            (total, group) => total + group.items.length,
            0,
          );
          const hasMore = categoryGroups.some(
            (group) =>
              group.pageInfo.hasNextPage ||
              group.totalCount > GLOBAL_SEARCH_PREVIEW_LIMIT,
          );

          return (
            <GlobalSearchPluginsGroup
              key={groupCategory}
              actionLabel={t('open-result', 'Open result')}
              groups={categoryGroups}
              heading={
                subcategory === 'all'
                  ? t(groupCategory, groupCategory)
                  : categoryGroups[0]?.subcategoryLabel
              }
              previewLimit={isAll ? GLOBAL_SEARCH_PREVIEW_LIMIT : undefined}
              searchValue={searchValue}
              sortOrder={sortOrder}
              onSelect={onContentSelect}
              onLoadMore={isAll ? undefined : onLoadMore}
              onShowMore={showMoreHandler(
                isAll && (itemCount > GLOBAL_SEARCH_PREVIEW_LIMIT || hasMore),
                groupCategory,
                onCategoryChange,
              )}
            />
          );
        },
      )}

      {waitingForContent && visibleItemCount === 0 && <GlobalSearchLoading />}
      {needsMoreCharacters && <GlobalSearchMinimumLength />}
      {showFailure && <GlobalSearchFailure onRetry={onRetry} />}
      {showEmpty && <GlobalSearchEmpty />}
    </Command.List>
  );
};

export const GlobalSearchDialog = ({
  open,
  onOpenChange,
  value,
  onValueChange,
  onClear,
  category,
  categories,
  subcategory,
  subcategories,
  onCategoryChange,
  onSubcategoryChange,
  groups,
  goToItems,
  quickAccessItems,
  totalCount,
  contentSearchReady,
  contentLoading,
  contentFailure,
  onContentSelect,
  onNavigationSelect,
  onLoadMore,
  onRetry,
  sortOrder,
  onSortOrderChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  category: TGlobalSearchCategory;
  categories: TGlobalSearchCategoryOption[];
  subcategory: string;
  subcategories: TGlobalSearchSubcategoryOption[];
  onCategoryChange: (category: TGlobalSearchCategory) => void;
  onSubcategoryChange: (subcategory: string) => void;
  groups: TGlobalSearchGroup[];
  goToItems: TNavigationSearchItem[];
  quickAccessItems: TNavigationSearchItem[];
  totalCount: number;
  contentSearchReady: boolean;
  contentLoading: boolean;
  contentFailure: boolean;
  onContentSelect: (path: string) => void;
  onNavigationSelect: (path: string, activityId?: string) => void;
  onLoadMore: (providerKey: string) => void;
  onRetry: () => void;
  sortOrder: TGlobalSearchSortOrder;
  onSortOrderChange: (order: TGlobalSearchSortOrder) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const isSearching = value.trim().length > 0;
  const primaryKey = isMacPlatform() ? '⌘' : 'Ctrl';
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    tabsRef.current
      ?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [category, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="w-[calc(100vw-2rem)] max-w-4xl gap-0 overflow-hidden border-0 p-0">
        <Dialog.Title className="sr-only">
          {t('placeholder', 'Search anything')}
        </Dialog.Title>
        <Dialog.Description className="sr-only">
          {t('description', 'Search navigation pages, content, and plugins')}
        </Dialog.Description>
        <Command className="rounded-lg" shouldFilter={false} loop>
          <div className="relative border-b">
            <Command.Input
              className="h-10 pr-36 text-sm"
              focusOnMount
              placeholder={t('placeholder', 'Search anything...')}
              value={value}
              variant="primary"
              wrapperClassName="h-10 border-b-0"
              onValueChange={onValueChange}
            />
            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
              {isSearching && (
                <span
                  aria-label={t('results-count', { count: totalCount })}
                  className="whitespace-nowrap px-2 text-xs tabular-nums text-muted-foreground"
                >
                  {t('results-count', { count: totalCount })}
                </span>
              )}
              {isSearching && (
                <Button
                  aria-label={t('clear', 'Clear search')}
                  className="size-8 text-muted-foreground"
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={onClear}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  <IconX className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center border-b">
            <Tabs
              className="min-w-0 flex-1"
              value={category}
              onValueChange={onCategoryChange}
            >
              <Tabs.List
                ref={tabsRef}
                className="hide-scroll flex w-full justify-start gap-1 overflow-x-auto border-b-0 px-2 py-0"
                variant="underline"
              >
                {categories.map((searchCategory) => (
                  <Tabs.Trigger
                    className="h-8 shrink-0 px-2 text-xs uppercase tracking-wide"
                    key={searchCategory.key}
                    value={searchCategory.key}
                  >
                    <span className="flex items-center gap-1.5">
                      <SearchCategoryLabel category={searchCategory} />
                      {searchCategory.count !== undefined &&
                        searchCategory.count > 0 && (
                          <span className="rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                            {searchCategory.count}
                          </span>
                        )}
                    </span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>

            {isSearching && (
              <Select
                value={sortOrder}
                onValueChange={(order) =>
                  onSortOrderChange(order as TGlobalSearchSortOrder)
                }
              >
                <Select.Trigger className="mr-2 h-7 w-44 shrink-0 text-xs">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="newest">
                    {t('newest-to-oldest', 'Newest to oldest')}
                  </Select.Item>
                  <Select.Item value="oldest">
                    {t('oldest-to-newest', 'Oldest to newest')}
                  </Select.Item>
                </Select.Content>
              </Select>
            )}
          </div>

          {subcategories.length > 1 && (
            <Tabs value={subcategory} onValueChange={onSubcategoryChange}>
              <Tabs.List className="hide-scroll flex w-full justify-start gap-1 overflow-x-auto border-b px-2 py-1">
                {subcategories.map((option) => (
                  <Tabs.Trigger
                    className="h-7 shrink-0 gap-1.5 px-2 text-xs"
                    key={option.key}
                    value={option.key}
                  >
                    {t(option.labelKey ?? option.key, option.label)}
                    <span className="rounded bg-muted px-1 text-[10px] tabular-nums text-muted-foreground">
                      {option.count}
                    </span>
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            </Tabs>
          )}

          <GlobalSearchResults
            category={category}
            subcategory={subcategory}
            contentFailure={contentFailure}
            contentLoading={contentLoading}
            contentSearchReady={contentSearchReady}
            goToItems={goToItems}
            groups={groups}
            quickAccessItems={quickAccessItems}
            searchValue={value.trim()}
            sortOrder={sortOrder}
            onCategoryChange={onCategoryChange}
            onContentSelect={onContentSelect}
            onLoadMore={onLoadMore}
            onNavigationSelect={onNavigationSelect}
            onRetry={onRetry}
          />

          <div className="flex min-h-9 flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Kbd variant="foreground">↑</Kbd>
              <Kbd variant="foreground">↓</Kbd>
              {t('navigate', 'navigate')}
              <Kbd className="ml-2" variant="foreground">
                ↵
              </Kbd>
              {t('open', 'open')}
            </span>
            <span className="flex items-center gap-2">
              {categories.length > 1 && (
                <>
                  <Kbd variant="foreground">{primaryKey} ←/→</Kbd>
                  {t('filter', 'filter')}
                </>
              )}
              <Kbd className="ml-2" variant="foreground">
                esc
              </Kbd>
              {t('close', 'close')}
            </span>
          </div>
        </Command>
      </Dialog.Content>
    </Dialog>
  );
};
