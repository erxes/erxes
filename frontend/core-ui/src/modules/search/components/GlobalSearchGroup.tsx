import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { IconArrowRight, IconLoader2 } from '@tabler/icons-react';
import { Button, Command, TSearchResultItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TGlobalSearchGroup,
  TGlobalSearchSortOrder,
  TNavigationSearchItem,
} from '@/search/types/GlobalSearch';
import { GlobalSearchItem } from '@/search/components/GlobalSearchItem';
import { compareGlobalSearchItems } from '@/search/utils/globalSearchResults';

const SearchGroupHeading = ({
  label,
  onShowMore,
}: {
  label: string;
  onShowMore?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <span className="flex min-h-6 items-center justify-between gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {onShowMore && (
        <Button
          className="h-6 gap-1 px-1.5 text-xs font-normal normal-case"
          size="sm"
          type="button"
          variant="ghost"
          onClick={onShowMore}
          onMouseDown={(event) => event.preventDefault()}
        >
          {t('show-more', 'Show more')}
          <IconArrowRight className="size-3.5" />
        </Button>
      )}
    </span>
  );
};

export const NavigationSearchGroup = ({
  heading,
  items,
  actionLabel,
  searchValue,
  previewLimit,
  onShowMore,
  onSelect,
}: {
  heading?: string;
  items: TNavigationSearchItem[];
  actionLabel: string;
  searchValue: string;
  previewLimit?: number;
  onShowMore?: () => void;
  onSelect: (path: string, activityId?: string) => void;
}) => {
  if (items.length === 0) {
    return null;
  }

  const visibleItems =
    previewLimit === undefined ? items : items.slice(0, previewLimit);
  const showMoreAction =
    previewLimit !== undefined && items.length > previewLimit
      ? onShowMore
      : undefined;

  return (
    <Command.Group
      className="p-1"
      heading={
        heading ? (
          <SearchGroupHeading label={heading} onShowMore={showMoreAction} />
        ) : undefined
      }
    >
      {visibleItems.map((item) => (
        <GlobalSearchItem
          key={item.id}
          actionLabel={actionLabel}
          commandValue={item.id}
          icon={item.icon}
          item={item}
          searchValue={searchValue}
          onSelect={(path) => onSelect(path, item.activityId)}
        />
      ))}
    </Command.Group>
  );
};

export const GlobalSearchProviderGroup = ({
  group,
  searchValue,
  actionLabel,
  previewLimit,
  onShowMore,
  onLoadMore,
  onSelect,
}: {
  group: TGlobalSearchGroup;
  searchValue: string;
  actionLabel: string;
  previewLimit?: number;
  onShowMore?: () => void;
  onLoadMore?: () => void;
  onSelect: (path: string) => void;
}) => {
  const { t } = useTranslation(group.labelNamespace ?? 'common', {
    keyPrefix: group.labelNamespace ? undefined : 'global-search',
  });
  const { t: tCommon } = useTranslation('common', {
    keyPrefix: 'global-search',
  });
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '160px 0px',
  });
  const label = t(group.labelKey ?? group.key, group.label);
  const visibleItems =
    previewLimit === undefined
      ? group.items
      : group.items.slice(0, previewLimit);
  const canLoadMore =
    Boolean(onLoadMore) &&
    group.pageInfo.hasNextPage &&
    !group.loadingMore &&
    !group.loadMoreError;

  useEffect(() => {
    if (inView && canLoadMore) {
      onLoadMore?.();
    }
  }, [canLoadMore, inView, onLoadMore]);

  if (group.status !== 'ok' || group.items.length === 0) {
    return null;
  }

  const hasMore =
    previewLimit !== undefined &&
    (group.items.length > previewLimit ||
      group.pageInfo.hasNextPage ||
      (group.totalCount ?? 0) > previewLimit);
  const showMoreAction = hasMore ? onShowMore : undefined;

  return (
    <Command.Group
      className="p-1"
      heading={<SearchGroupHeading label={label} onShowMore={showMoreAction} />}
    >
      {visibleItems.map((item) => (
        <GlobalSearchItem
          key={item.id}
          actionLabel={actionLabel}
          commandValue={`${group.key}:${item.id}`}
          icon={group.icon}
          item={item}
          searchValue={group.searchValue ?? searchValue}
          onSelect={onSelect}
        />
      ))}

      {onLoadMore && group.pageInfo.hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex min-h-10 items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          {group.loadingMore && (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {tCommon('loading-more', 'Loading more...')}
            </>
          )}
        </div>
      )}

      {onLoadMore && group.loadMoreError && (
        <div className="flex min-h-10 items-center justify-center gap-2 text-xs text-destructive">
          <span>
            {tCommon('load-more-failed', "Couldn't load more results")}
          </span>
          <Button
            className="h-7 px-2 text-xs"
            size="sm"
            type="button"
            variant="secondary"
            onClick={onLoadMore}
            onMouseDown={(event) => event.preventDefault()}
          >
            {tCommon('retry', 'Retry')}
          </Button>
        </div>
      )}
    </Command.Group>
  );
};

type TPluginsMergedItem = {
  key: string;
  icon?: React.ElementType;
  item: TSearchResultItem;
};

const toPluginsMergedItem = (
  group: TGlobalSearchGroup,
  item: TSearchResultItem,
): TPluginsMergedItem => ({
  key: `${group.key}:${item.id}`,
  icon: group.icon,
  item,
});

// Renders every plugin source as a single list with no per-source heading.
export const GlobalSearchPluginsGroup = ({
  groups,
  searchValue,
  actionLabel,
  previewLimit,
  sortOrder,
  heading,
  onLoadMore,
  onShowMore,
  onSelect,
}: {
  groups: TGlobalSearchGroup[];
  searchValue: string;
  actionLabel: string;
  previewLimit?: number;
  sortOrder: TGlobalSearchSortOrder;
  heading?: string;
  onLoadMore?: (providerKey: string) => void;
  onShowMore?: () => void;
  onSelect: (path: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '160px 0px',
  });
  const [merged, setMerged] = useState<TPluginsMergedItem[]>([]);
  const streamRef = useRef<{
    search: string;
    scope: string;
    keys: Set<string>;
    items: TPluginsMergedItem[];
  }>({ search: '', scope: '', keys: new Set(), items: [] });
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const loadingIndicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const stream = streamRef.current;
    const scope = groups
      .map(({ key }) => key)
      .sort((left, right) => left.localeCompare(right))
      .join(':');

    if (stream.search !== searchValue || stream.scope !== scope) {
      stream.search = searchValue;
      stream.scope = scope;
      stream.keys = new Set();
      stream.items = [];
      setMerged([]);
    }

    const { keys, items } = stream;
    let changed = false;

    for (const group of groups) {
      for (const item of group.items) {
        const key = `${group.key}:${item.id}`;

        if (keys.has(key)) {
          continue;
        }

        keys.add(key);
        items.push(toPluginsMergedItem(group, item));
        changed = true;
      }
    }

    if (changed) {
      setMerged([...items]);
    }
  }, [groups, searchValue]);

  const sortedItems = useMemo(
    () =>
      [...merged].sort((left, right) =>
        compareGlobalSearchItems(left.item, right.item, sortOrder),
      ),
    [merged, sortOrder],
  );
  const visibleItems =
    previewLimit === undefined
      ? sortedItems
      : sortedItems.slice(0, previewLimit);
  const pendingSources = groups.filter(
    (group) =>
      group.pageInfo.hasNextPage && !group.loadingMore && !group.loadMoreError,
  );
  const anyLoading = groups.some((group) => group.loadingMore);
  const anyError = groups.some((group) => group.loadMoreError);
  const canLoadMore = Boolean(onLoadMore) && pendingSources.length > 0;
  const showLoadMoreSentinel =
    Boolean(onLoadMore) && (pendingSources.length > 0 || anyLoading);

  useEffect(() => {
    if (anyLoading) {
      if (loadingIndicatorTimer.current) {
        clearTimeout(loadingIndicatorTimer.current);
        loadingIndicatorTimer.current = null;
      }
      setShowLoadingIndicator(true);
      return;
    }

    if (!showLoadingIndicator || loadingIndicatorTimer.current) {
      return;
    }

    loadingIndicatorTimer.current = setTimeout(() => {
      setShowLoadingIndicator(false);
      loadingIndicatorTimer.current = null;
    }, 500);
  }, [anyLoading, showLoadingIndicator]);

  useEffect(() => {
    if (!onLoadMore) {
      return;
    }

    if (inView && canLoadMore) {
      for (const group of pendingSources) {
        onLoadMore(group.key);
      }
    }
  }, [canLoadMore, inView, onLoadMore, pendingSources]);

  if (merged.length === 0) {
    return null;
  }

  const effectiveSearchValue =
    groups.find((group) => group.items.length > 0)?.searchValue ?? searchValue;
  const hasMore =
    previewLimit !== undefined &&
    (merged.length > previewLimit ||
      pendingSources.length > 0 ||
      groups.some((group) => (group.totalCount ?? 0) > previewLimit));
  const showMoreAction = hasMore ? onShowMore : undefined;

  return (
    <Command.Group
      className="p-1"
      heading={
        heading ? (
          <SearchGroupHeading label={heading} onShowMore={showMoreAction} />
        ) : undefined
      }
    >
      {visibleItems.map(({ key, icon: Icon, item }) => (
        <GlobalSearchItem
          key={key}
          actionLabel={actionLabel}
          commandValue={key}
          icon={Icon}
          item={item}
          searchValue={effectiveSearchValue}
          onSelect={onSelect}
        />
      ))}

      {showLoadMoreSentinel && (
        <div
          ref={loadMoreRef}
          className="flex min-h-10 items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          {showLoadingIndicator && (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {t('loading-more', 'Loading more...')}
            </>
          )}
        </div>
      )}

      {onLoadMore && anyError && (
        <div className="flex min-h-10 items-center justify-center gap-2 text-xs text-destructive">
          <span>{t('load-more-failed', "Couldn't load more results")}</span>
          <Button
            className="h-7 px-2 text-xs"
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => {
              for (const group of groups) {
                if (group.loadMoreError) {
                  onLoadMore(group.key);
                }
              }
            }}
            onMouseDown={(event) => event.preventDefault()}
          >
            {t('retry', 'Retry')}
          </Button>
        </div>
      )}
    </Command.Group>
  );
};
