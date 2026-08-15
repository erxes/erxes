import { IconX } from '@tabler/icons-react';
import { Button, Command, Dialog, Kbd, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import {
  GlobalSearchProviderGroup,
  NavigationSearchGroup,
} from '@/search/components/GlobalSearchGroup';
import {
  GlobalSearchEmpty,
  GlobalSearchFailure,
  GlobalSearchLoading,
  GlobalSearchMinimumLength,
} from '@/search/components/GlobalSearchStates';
import { GLOBAL_SEARCH_PER_GROUP } from '@/search/constants/globalSearch';
import {
  TGlobalSearchCategory,
  TGlobalSearchCategoryOption,
  TGlobalSearchGroup,
  TNavigationSearchItem,
} from '@/search/types/GlobalSearch';

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
  onNavigationSelect: (path: string, activityId: string) => void;
  onLoadMore: (providerKey: string) => void;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const isSearching = searchValue.length > 0;

  if (!isSearching) {
    const isAll = category === 'all';
    const isGoTo = category === 'go-to';
    const visibleItemCount =
      (isAll || isGoTo ? goToItems.length : 0) +
      (isAll ? quickAccessItems.length : 0);

    return (
      <Command.List
        key={category}
        className="styled-scroll m-0 min-h-40 max-h-[min(60vh,28rem)] p-1"
      >
        {(isAll || isGoTo) && (
          <NavigationSearchGroup
            actionLabel={t('go-to-page', 'Go to page')}
            heading={t('go-to', 'Go to')}
            items={goToItems}
            previewLimit={isAll ? GLOBAL_SEARCH_PER_GROUP : undefined}
            searchValue=""
            onSelect={onNavigationSelect}
            onShowMore={isAll ? () => onCategoryChange('go-to') : undefined}
          />
        )}
        {isAll && (
          <NavigationSearchGroup
            actionLabel={t('open-plugin', 'Open plugin')}
            heading={t('quick-access', 'Quick access')}
            items={quickAccessItems}
            searchValue=""
            onSelect={onNavigationSelect}
          />
        )}
        {visibleItemCount === 0 && <GlobalSearchEmpty />}
      </Command.List>
    );
  }

  const visibleGroups = groups.filter(
    (group) => group.status === 'ok' && group.items.length > 0,
  );
  const activeProviderGroup = visibleGroups.find(
    (group) => group.key === category,
  );
  const isAll = category === 'all';
  const isGoTo = category === 'go-to';
  const visibleItemCount = isAll
    ? goToItems.length +
      visibleGroups.reduce(
        (total, group) =>
          total + Math.min(group.items.length, GLOBAL_SEARCH_PER_GROUP),
        0,
      )
    : isGoTo
      ? goToItems.length
      : (activeProviderGroup?.items.length ?? 0);
  const waitingForContent =
    contentSearchReady &&
    contentLoading &&
    (isAll || Boolean(activeProviderGroup));
  const needsMoreCharacters =
    !contentSearchReady && visibleItemCount === 0 && (isAll || !isGoTo);
  const showFailure =
    contentFailure && visibleItemCount === 0 && (isAll || !isGoTo);
  const showEmpty =
    visibleItemCount === 0 &&
    !waitingForContent &&
    !needsMoreCharacters &&
    !showFailure;

  return (
    <Command.List
      key={category}
      className="styled-scroll m-0 min-h-40 max-h-[min(60vh,28rem)] p-1"
    >
      {(isAll || isGoTo) && (
        <NavigationSearchGroup
          actionLabel={t('go-to-page', 'Go to page')}
          heading={t('go-to', 'Go to')}
          items={goToItems}
          previewLimit={isAll ? GLOBAL_SEARCH_PER_GROUP : undefined}
          searchValue={searchValue}
          onSelect={onNavigationSelect}
          onShowMore={isAll ? () => onCategoryChange('go-to') : undefined}
        />
      )}

      {isAll &&
        visibleGroups.map((group) => (
          <GlobalSearchProviderGroup
            key={group.key}
            actionLabel={t('open-result', 'Open result')}
            group={group}
            previewLimit={GLOBAL_SEARCH_PER_GROUP}
            searchValue={searchValue}
            onSelect={onContentSelect}
            onShowMore={() => onCategoryChange(group.key)}
          />
        ))}

      {activeProviderGroup && (
        <GlobalSearchProviderGroup
          actionLabel={t('open-result', 'Open result')}
          group={activeProviderGroup}
          searchValue={searchValue}
          onLoadMore={() => onLoadMore(activeProviderGroup.key)}
          onSelect={onContentSelect}
        />
      )}

      {showFailure && <GlobalSearchFailure onRetry={onRetry} />}
      {waitingForContent && visibleItemCount === 0 && <GlobalSearchLoading />}
      {needsMoreCharacters && <GlobalSearchMinimumLength />}
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
  onNavigationSelect: (path: string, activityId: string) => void;
  onLoadMore: (providerKey: string) => void;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const isSearching = value.trim().length > 0;
  const primaryKey = isMacPlatform() ? '⌘' : 'Ctrl';
  const shortcutCount = Math.min(categories.length, 9);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="w-[calc(100vw-2rem)] max-w-3xl gap-0 overflow-hidden border-0 p-0">
        <Dialog.Title className="sr-only">
          {t('placeholder', 'Search anything')}
        </Dialog.Title>
        <Dialog.Description className="sr-only">
          {t('description', 'Search navigation pages, content, and plugins')}
        </Dialog.Description>
        <Command className="rounded-lg" shouldFilter={false} loop>
          <div className="relative border-b">
            <Command.Input
              className="h-12 pr-40 text-sm"
              focusOnMount
              placeholder={t('placeholder', 'Search anything...')}
              value={value}
              variant="primary"
              wrapperClassName="h-12 border-b-0"
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
              className="flex w-full justify-start gap-1 overflow-x-auto border-b px-3 py-1"
              variant="underline"
            >
              {categories.map((searchCategory, index) => (
                <Tabs.Trigger
                  className="h-9 shrink-0 gap-2 px-3 text-xs uppercase tracking-wide"
                  key={searchCategory.key}
                  value={searchCategory.key}
                >
                  <SearchCategoryLabel category={searchCategory} />
                  {index < 9 && (
                    <span className="text-xs opacity-60">
                      {primaryKey}
                      {index + 1}
                    </span>
                  )}
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

          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground">
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
              {shortcutCount > 1 && (
                <>
                  <Kbd variant="foreground">
                    {primaryKey}1–{shortcutCount}
                  </Kbd>
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
