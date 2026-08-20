import { IconX } from '@tabler/icons-react';
import { Button, Command, Dialog, Kbd, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import {
  GlobalSearchPluginsGroup,
  GlobalSearchProviderGroup,
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

const GlobalSearchResults = ({
  category,
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
}: {
  category: TGlobalSearchCategory;
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
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const isSearching = searchValue.length > 0;

  if (!isSearching) {
    return (
      <Command.List
        key={category}
        className="styled-scroll m-0 min-h-32 max-h-[min(60vh,24rem)] p-1"
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

  const visibleGroups = groups.filter(
    (group) => group.status === 'ok' && group.items.length > 0,
  );
  const isAll = category === 'all';
  const isNavCategory = category === 'navigation';
  const isContentCategory = CONTENT_CATEGORIES.has(category);
  const contentScopeActive = isAll || isContentCategory;
  const scopedContentGroups = visibleGroups.filter(
    (group) => isAll || group.category === category,
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
  const visiblePluginCount = isAll
    ? Math.min(pluginItemCount, GLOBAL_SEARCH_PREVIEW_LIMIT)
    : pluginItemCount;
  const navigationItems = isNavCategory || isAll ? goToItems : [];
  const otherItemCount = otherContentGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );
  const visibleOtherCount = isAll
    ? Math.min(otherItemCount, GLOBAL_SEARCH_PREVIEW_LIMIT)
    : otherItemCount;
  const visibleItemCount =
    navigationItems.length + visiblePluginCount + visibleOtherCount;
  const waitingForContent =
    contentSearchReady && contentLoading && contentScopeActive;
  const needsMoreCharacters =
    !contentSearchReady && visibleItemCount === 0 && contentScopeActive;
  const showFailure =
    contentFailure && visibleItemCount === 0 && contentScopeActive;
  const showEmpty =
    visibleItemCount === 0 &&
    !waitingForContent &&
    !needsMoreCharacters &&
    !showFailure;

  return (
    <Command.List
      key={category}
      className="styled-scroll m-0 min-h-32 max-h-[min(60vh,24rem)] p-1"
    >
      {navigationItems.length > 0 && (
        <NavigationSearchGroup
          actionLabel={t('go-to-page', 'Go to page')}
          heading={t('navigation', 'Navigation')}
          items={navigationItems}
          previewLimit={isAll ? GLOBAL_SEARCH_PREVIEW_LIMIT : undefined}
          searchValue={searchValue}
          onSelect={onNavigationSelect}
          onShowMore={
            isAll && navigationItems.length > GLOBAL_SEARCH_PREVIEW_LIMIT
              ? () => onCategoryChange('navigation')
              : undefined
          }
        />
      )}

      {pluginGroups.length > 0 && (
        <GlobalSearchPluginsGroup
          actionLabel={t('open-result', 'Open result')}
          groups={pluginGroups}
          heading={isAll ? t('plugins', 'Plugins') : undefined}
          previewLimit={isAll ? GLOBAL_SEARCH_PREVIEW_LIMIT : undefined}
          searchValue={searchValue}
          onLoadMore={onLoadMore}
          onSelect={onContentSelect}
          onShowMore={
            isAll && pluginItemCount > GLOBAL_SEARCH_PREVIEW_LIMIT
              ? () => onCategoryChange('plugins')
              : undefined
          }
        />
      )}

      {otherContentGroups.map((group) => (
        <GlobalSearchProviderGroup
          key={group.key}
          actionLabel={t('open-result', 'Open result')}
          group={group}
          previewLimit={isAll ? GLOBAL_SEARCH_PREVIEW_LIMIT : undefined}
          searchValue={searchValue}
          onSelect={onContentSelect}
          onLoadMore={() => onLoadMore(group.key)}
          onShowMore={
            isAll &&
            (group.items.length > GLOBAL_SEARCH_PREVIEW_LIMIT ||
              group.pageInfo.hasNextPage ||
              (group.totalCount ?? 0) > GLOBAL_SEARCH_PREVIEW_LIMIT)
              ? () => onCategoryChange(group.category)
              : undefined
          }
        />
      ))}

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
  onCategoryChange,
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  onClear: () => void;
  category: TGlobalSearchCategory;
  categories: TGlobalSearchCategoryOption[];
  onCategoryChange: (category: TGlobalSearchCategory) => void;
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
      <Dialog.Content className="w-[calc(100vw-2rem)] max-w-2xl gap-0 overflow-hidden border-0 p-0">
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

          <Tabs value={category} onValueChange={onCategoryChange}>
            <Tabs.List
              ref={tabsRef}
              className="hide-scroll flex w-full justify-start gap-1 overflow-x-auto border-b px-2 py-0"
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

          <GlobalSearchResults
            category={category}
            contentFailure={contentFailure}
            contentLoading={contentLoading}
            contentSearchReady={contentSearchReady}
            goToItems={goToItems}
            groups={groups}
            quickAccessItems={quickAccessItems}
            searchValue={value.trim()}
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
