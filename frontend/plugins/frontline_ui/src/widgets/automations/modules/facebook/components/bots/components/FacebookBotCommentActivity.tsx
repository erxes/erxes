import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { IconAlertTriangle } from '@tabler/icons-react';
import {
  Badge,
  Label,
  Skeleton,
  formatDateISOStringToRelativeDate,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TFacebookBotCommentReplyPost,
  TFacebookBotCommentReplyStat,
  useFacebookBotCommentReplyStats,
} from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotCommentReplyStats';
import { useFacebookBotDelivery } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotDelivery';

/** What this bot's page has been replying under its posts. */
export const FacebookBotCommentActivity = ({ bot }: { bot?: IFacebookBot }) => {
  const { t } = useTranslation('frontline');
  const { delivery, loading } = useFacebookBotDelivery(bot?._id);
  const {
    stats,
    total,
    loading: statsLoading,
  } = useFacebookBotCommentReplyStats(bot?._id);

  if (!bot?._id) {
    return null;
  }

  const blockedUntil = bot.health?.sendBlockedUntil;
  const isBlocked =
    Boolean(blockedUntil) && new Date(blockedUntil as string) > new Date();

  return (
    <div className="flex flex-col gap-2">
      <Label>{t('comment-replies', { defaultValue: 'Comment replies' })}</Label>
      <p className="text-xs text-muted-foreground">
        {t('comment-replies-description', {
          defaultValue:
            'Public replies this page posts under comments. Private replies are sent separately and are not counted here.',
        })}
      </p>

      {isBlocked && (
        <p className="flex items-start gap-1.5 text-xs text-warning">
          <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t('public-replies-paused-until', {
            defaultValue:
              'Facebook refused a public reply, so they are paused until {{until}}. Private replies are unaffected.',
            until: new Date(blockedUntil as string).toLocaleString(),
          })}
        </p>
      )}

      {(bot.health?.sendBlockCount || 0) > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('public-replies-paused-count', {
            defaultValue: 'Paused {{times}} time(s) so far.',
            times: bot.health?.sendBlockCount,
          })}
        </p>
      )}

      {loading && <Skeleton className="h-8 w-full" />}

      {!loading && delivery && (
        <div className="flex flex-col gap-1 rounded-md border px-3 py-2">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <DeliveryCount
              label={t('queued', { defaultValue: 'Queued' })}
              value={delivery.pending}
            />
            <DeliveryCount
              label={t('sent', { defaultValue: 'Sent' })}
              value={delivery.sent}
            />
            <DeliveryCount
              label={t('failed', { defaultValue: 'Failed' })}
              value={delivery.failed}
            />
          </div>
          {delivery.nextSendAt && delivery.pending > 0 && (
            <span className="text-xs text-muted-foreground">
              {t('next-public-reply-at', {
                defaultValue: 'Next public reply at {{at}}',
                at: new Date(delivery.nextSendAt).toLocaleTimeString(),
              })}
            </span>
          )}
        </div>
      )}

      <Label className="pt-2">
        {t('replies-in-use', { defaultValue: 'Replies in use' })}
      </Label>
      <p className="text-xs text-muted-foreground">
        {t('replies-in-use-description', {
          defaultValue:
            'Meta counts repetition, not volume. A single sentence taking most of the share is what gets a page blocked.',
        })}
      </p>

      {statsLoading && <Skeleton className="h-16 w-full" />}

      {!statsLoading && !stats.length && (
        <p className="text-sm text-muted-foreground">
          {t('no-comment-replies', {
            defaultValue: 'This bot has not replied to a comment yet.',
          })}
        </p>
      )}

      {stats.length > 0 && (
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {stats.map((stat) => (
            <ReplyStatRow key={stat.text} stat={stat} total={total} />
          ))}
        </div>
      )}
    </div>
  );
};

const DeliveryCount = ({ label, value }: { label: string; value: number }) => (
  <span className="flex items-center gap-1.5">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold">{value}</span>
  </span>
);

const ReplyStatRow = ({
  stat,
  total,
}: {
  stat: TFacebookBotCommentReplyStat;
  total: number;
}) => {
  const { t } = useTranslation('frontline');
  const share = total ? Math.round((stat.total / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-1 rounded-md border px-3 py-2">
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 truncate text-sm">
          &ldquo;{stat.text}&rdquo;
        </span>
        <Badge variant="secondary" className="shrink-0">
          {share}%
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          {t('sent', { defaultValue: 'Sent' })} {stat.sent}
        </span>
        {stat.failed > 0 && (
          <span className="text-destructive">
            {t('failed', { defaultValue: 'Failed' })} {stat.failed}
          </span>
        )}
        {stat.pending > 0 && (
          <span>
            {t('queued', { defaultValue: 'Queued' })} {stat.pending}
          </span>
        )}
        {stat.lastAt && (
          <span className="ml-auto">
            {formatDateISOStringToRelativeDate(stat.lastAt)}
          </span>
        )}
      </div>
      {stat.lastError && (
        <p className="truncate text-xs text-destructive">{stat.lastError}</p>
      )}

      {stat.posts?.length > 0 && (
        <div className="flex flex-col gap-0.5 border-t pt-1">
          <span className="text-xs text-muted-foreground">
            {t('used-under-posts', {
              defaultValue: 'Used under {{count}} post',
              count: stat.postCount,
            })}
          </span>
          {stat.posts.map((post) => (
            <ReplyPostRow key={post.postId} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

const ReplyPostRow = ({ post }: { post: TFacebookBotCommentReplyPost }) => {
  // The post's own text is what identifies it; the id only survives as a
  // fallback for a post erxes never opened a conversation for.
  const label = post.content?.trim() || `#${post.postId.slice(-6)}`;
  const body = (
    <>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="shrink-0 text-muted-foreground">×{post.count}</span>
    </>
  );

  if (!post.permalinkUrl) {
    return <span className="flex items-center gap-2 text-xs">{body}</span>;
  }

  return (
    <a
      href={post.permalinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs hover:underline"
    >
      {body}
    </a>
  );
};
