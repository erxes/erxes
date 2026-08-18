import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { IconArrowRight, IconLoader2 } from '@tabler/icons-react';
import { Button, Command, TSearchResultItem } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TGlobalSearchGroup,
  TNavigationSearchItem,
  TSearchProviderCategory,
} from '@/search/types/GlobalSearch';
import { GlobalSearchItem } from '@/search/components/GlobalSearchItem';

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
  heading: string;
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
        <SearchGroupHeading label={heading} onShowMore={showMoreAction} />
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

type TCategoryGroupItem = {
  providerKey: string;
  item: TSearchResultItem;
};

export const GlobalSearchCategoryGroup = ({
  category,
  label,
  labelKey,
  labelNamespace,
  icon: Icon,
  groups,
  searchValue,
  actionLabel,
  previewLimit,
  onShowMore,
  onLoadMore,
  onSelect,
}: {
  category: TSearchProviderCategory;
  label: string;
  labelKey?: string;
  labelNamespace?: string;
  icon?: React.ElementType;
  groups: TGlobalSearchGroup[];
  searchValue: string;
  actionLabel: string;
  previewLimit?: number;
  onShowMore?: () => void;
  onLoadMore?: (category: TSearchProviderCategory) => void;
  onSelect: (path: string) => void;
}) => {
  const { t } = useTranslation(labelNamespace ?? 'common', {
    keyPrefix: labelNamespace ? undefined : 'global-search',
  });
  const { t: tCommon } = useTranslation('common', {
    keyPrefix: 'global-search',
  });
  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: '160px 0px',
  });
  const heading = t(labelKey ?? category, label);

  const items = groups.reduce<TCategoryGroupItem[]>((acc, group) => {
    for (const item of group.items) {
      acc.push({ providerKey: group.key, item });
    }

    return acc;
  }, []);

  const visibleItems =
    previewLimit === undefined ? items : items.slice(0, previewLimit);
  const hasAnyMore = groups.some(
    (group) =>
      group.pageInfo.hasNextPage ||
      (group.totalCount ?? 0) > (previewLimit ?? group.items.length),
  );
  const loadingMore = groups.some((group) => group.loadingMore);
  const loadMoreError = groups.some((group) => group.loadMoreError);
  const canLoadMore =
    Boolean(onLoadMore) && hasAnyMore && !loadingMore && !loadMoreError;

  const previousInView = useRef(false);

  useEffect(() => {
    const enteredView = inView && !previousInView.current;
    previousInView.current = inView;

    if (enteredView && canLoadMore) {
      onLoadMore?.(category);
    }
  }, [canLoadMore, inView, onLoadMore, category]);

  if (items.length === 0) {
    return null;
  }

  const hasMore =
    previewLimit !== undefined && (items.length > previewLimit || hasAnyMore);
  const showMoreAction = hasMore ? onShowMore : undefined;

  return (
    <Command.Group
      className="p-1"
      heading={
        <SearchGroupHeading label={heading} onShowMore={showMoreAction} />
      }
    >
      {visibleItems.map(({ providerKey, item }) => (
        <GlobalSearchItem
          key={`${providerKey}:${item.id}`}
          actionLabel={actionLabel}
          commandValue={`${providerKey}:${item.id}`}
          icon={Icon}
          item={item}
          searchValue={searchValue}
          onSelect={onSelect}
        />
      ))}

      {onLoadMore && hasAnyMore && (
        <div
          ref={loadMoreRef}
          className="flex min-h-10 items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          {loadingMore && (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              {tCommon('loading-more', 'Loading more...')}
            </>
          )}
        </div>
      )}

      {onLoadMore && loadMoreError && (
        <div className="flex min-h-10 items-center justify-center gap-2 text-xs text-destructive">
          <span>
            {tCommon('load-more-failed', "Couldn't load more results")}
          </span>
          <Button
            className="h-7 px-2 text-xs"
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => onLoadMore(category)}
          >
            {tCommon('retry', 'Retry')}
          </Button>
        </div>
      )}
    </Command.Group>
  );
};
