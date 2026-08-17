import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { IconArrowRight, IconLoader2 } from '@tabler/icons-react';
import { Button, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TGlobalSearchGroup,
  TNavigationSearchItem,
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

  return (
    <Command.Group
      className="p-1"
      heading={<SearchGroupHeading label={heading} onShowMore={onShowMore} />}
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

  return (
    <Command.Group
      className="p-1"
      heading={<SearchGroupHeading label={label} onShowMore={onShowMore} />}
    >
      {visibleItems.map((item) => (
        <GlobalSearchItem
          key={item.id}
          actionLabel={actionLabel}
          commandValue={`${group.key}:${item.id}`}
          icon={group.icon}
          item={item}
          searchValue={searchValue}
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
          >
            {tCommon('retry', 'Retry')}
          </Button>
        </div>
      )}
    </Command.Group>
  );
};
