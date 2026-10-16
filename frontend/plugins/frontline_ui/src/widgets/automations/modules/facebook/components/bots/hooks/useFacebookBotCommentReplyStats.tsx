import { FACEBOOK_BOT_COMMENT_REPLY_STATS } from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import type { FacebookMessengerBotCommentReplyStatsQuery } from '~/gql/graphql';

export type TFacebookBotCommentReplyStat = NonNullable<
  NonNullable<
    FacebookMessengerBotCommentReplyStatsQuery['facebookMessengerBotCommentReplyStats']
  >[number]
>;

export type TFacebookBotCommentReplyPost = NonNullable<
  NonNullable<TFacebookBotCommentReplyStat['posts']>[number]
>;

/**
 * One row per distinct reply this page has posted, busiest first, with the
 * share each takes of everything the page has said.
 */
export const useFacebookBotCommentReplyStats = (botId?: string, limit = 10) => {
  const { data, loading } = useQuery(FACEBOOK_BOT_COMMENT_REPLY_STATS, {
    variables: botId ? { _id: botId, limit } : undefined,
    skip: !botId,
    // The queue drains while the sheet is open.
    pollInterval: 30_000,
  });

  const stats = useMemo(
    () => data?.facebookMessengerBotCommentReplyStats?.filter(isDefined) ?? [],
    [data],
  );

  const total = useMemo(
    () => stats.reduce((sum, stat) => sum + (stat.total ?? 0), 0),
    [stats],
  );

  return { stats, total, loading };
};
