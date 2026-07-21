import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Avatar, Badge, Button, Skeleton, Tooltip } from 'erxes-ui';
import { usePermissionCheck } from 'ui-modules';
import { IconCheck, IconStarOff, IconX } from '@tabler/icons-react';
import {
  IPostRating,
  PostRatingStatus,
  usePostRatings,
} from '../hooks/usePostRatings';
import {
  PostModerationDeleteAction,
  PostModerationLoadMore,
} from './PostModerationControls';
import { StarRating } from './StarRating';

interface PostRatingsProps {
  postId: string;
  clientPortalId: string;
  allowRatings?: boolean;
}

interface RatingItemProps {
  rating: IPostRating;
  canApprove: boolean;
  canDelete: boolean;
  busy: boolean;
  onChangeStatus: (id: string, status: PostRatingStatus) => void;
  onDelete: (id: string) => void;
}

const STATUS_VARIANT: Record<
  PostRatingStatus,
  'success' | 'warning' | 'destructive'
> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'destructive',
};

const formatRelativeTime = (value: string | undefined, t: TFunction) => {
  if (!value) return '';

  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (minutes < 1) return t('rating-just-now');
  if (minutes < 60) return t('rating-minutes-ago', { count: minutes });
  if (hours < 24) return t('rating-hours-ago', { count: hours });
  if (days < 7) return t('rating-days-ago', { count: days });
  return date.toLocaleDateString();
};

const RatingItem = ({
  rating,
  canApprove,
  canDelete,
  busy,
  onChangeStatus,
  onDelete,
}: RatingItemProps) => {
  const { t } = useTranslation('content');
  const initial = rating.authorId.charAt(0).toUpperCase() || '?';

  return (
    <div className="group rounded-lg border bg-card p-3 transition-colors hover:border-foreground/20">
      <div className="flex items-center gap-2">
        <Avatar size="lg">
          <Avatar.Fallback className="bg-primary/10 text-primary">
            {initial}
          </Avatar.Fallback>
        </Avatar>
        <span className="truncate text-sm font-medium">
          {t('portal-visitor')}
        </span>
        <Badge variant={STATUS_VARIANT[rating.status]}>
          {t(`rating-status-${rating.status}`)}
        </Badge>
        {rating.createdAt && (
          <Tooltip>
            <Tooltip.Trigger asChild>
              <span className="ml-auto text-xs text-muted-foreground">
                {formatRelativeTime(rating.createdAt, t)}
              </span>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {new Date(rating.createdAt).toLocaleString()}
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>

      <StarRating
        value={rating.rating}
        label={t('star-rating-label', { rating: rating.rating })}
        className="mt-3"
      />

      {(canApprove || canDelete) && (
        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {canApprove && rating.status !== 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-success hover:text-success"
              onClick={() => onChangeStatus(rating._id, 'approved')}
              disabled={busy}
            >
              <IconCheck /> {t('approve-rating')}
            </Button>
          )}
          {canApprove && rating.status !== 'rejected' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-warning hover:text-warning"
              onClick={() => onChangeStatus(rating._id, 'rejected')}
              disabled={busy}
            >
              <IconX /> {t('reject-rating')}
            </Button>
          )}
          {canDelete && (
            <PostModerationDeleteAction
              disabled={busy}
              title={t('delete-rating-title')}
              description={t('delete-rating-description')}
              onDelete={() => onDelete(rating._id)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export const PostRatings = ({
  postId,
  clientPortalId,
  allowRatings,
}: PostRatingsProps) => {
  const { t } = useTranslation('content');
  const { hasActionPermission } = usePermissionCheck();
  const {
    ratings,
    totalCount,
    summary,
    hasMore,
    error,
    loading,
    loadingMore,
    changingStatus,
    deleting,
    changeStatus,
    deleteRating,
    loadMore,
  } = usePostRatings({ postId, clientPortalId });
  const canApprove = hasActionPermission('cmsPostsApprove');
  const canDelete = hasActionPermission('cmsPostsRemove');
  const busy = changingStatus || deleting;

  const renderRatings = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-lg border bg-card p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-3 h-4 w-28" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {t('failed-to-load-ratings')}: {error.message}
        </div>
      );
    }

    if (ratings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground">
          <IconStarOff className="size-8 opacity-50" />
          <p className="text-sm">{t('no-ratings-yet')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {ratings.map((rating) => (
          <RatingItem
            key={rating._id}
            rating={rating}
            canApprove={canApprove}
            canDelete={canDelete}
            busy={busy}
            onChangeStatus={(id, status) => void changeStatus(id, status)}
            onDelete={(id) => void deleteRating(id)}
          />
        ))}
        {hasMore && (
          <PostModerationLoadMore
            loading={loadingMore}
            loadingLabel={t('loading-ratings')}
            loadMoreLabel={t('load-more-ratings')}
            onLoadMore={() => void loadMore()}
          />
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 border-t px-4 pb-8 pt-6">
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-semibold">{t('ratings')}</h3>
        <Badge variant="secondary">{totalCount}</Badge>
      </div>

      {allowRatings !== true && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
          <IconStarOff className="size-4 shrink-0" />
          <span>{t('ratings-disabled-description')}</span>
        </div>
      )}

      <div className="mb-6 grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[auto_1fr]">
        <div className="flex min-w-32 flex-col justify-center">
          <span className="text-3xl font-semibold">
            {summary.averageRating.toFixed(1)}
          </span>
          <StarRating
            value={summary.averageRating}
            label={t('average-star-rating-label', {
              rating: summary.averageRating.toFixed(1),
            })}
            size="lg"
          />
          <span className="mt-1 text-xs text-muted-foreground">
            {t('approved-ratings-count', { count: summary.totalCount })}
          </span>
        </div>

        <div className="space-y-1.5">
          {[...summary.distribution].reverse().map((bucket) => {
            const percentage =
              summary.totalCount === 0
                ? 0
                : (bucket.count / summary.totalCount) * 100;

            return (
              <div
                key={bucket.rating}
                className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-xs"
              >
                <span>{bucket.rating}★</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-warning"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-right text-muted-foreground">
                  {bucket.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {renderRatings()}
    </div>
  );
};
