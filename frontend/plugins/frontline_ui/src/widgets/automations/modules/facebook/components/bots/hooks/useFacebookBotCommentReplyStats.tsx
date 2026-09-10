import { FACEBOOK_BOT_COMMENT_REPLY_STATS } from '@/integrations/facebook/graphql/queries/facebookBots';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export type TFacebookBotCommentReplyPost = {
  postId: string;
  count: number;
  content?: string;
  permalinkUrl?: string;
};

export type TFacebookBotCommentReplyStat = {
  text: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  postCount: number;
  posts: TFacebookBotCommentReplyPost[];
  lastAt?: string;
  lastError?: string;
};

/**
 * One row per distinct reply this page has posted, busiest first, with the
 * share each takes of everything the page has said.
 */
export const useFacebookBotCommentReplyStats = (botId?: string, limit = 10) => {
  const { data, loading } = useQuery<{
    facebookMessengerBotCommentReplyStats: TFacebookBotCommentReplyStat[];
  }>(FACEBOOK_BOT_COMMENT_REPLY_STATS, {
    variables: { _id: botId, limit },
    skip: !botId,
    // The queue drains while the sheet is open.
    pollInterval: 30_000,
  });

  const stats = useMemo(
    () => data?.facebookMessengerBotCommentReplyStats || [],
    [data],
  );

  const total = useMemo(
    () => stats.reduce((sum, stat) => sum + stat.total, 0),
    [stats],
  );

  return { stats, total, loading };
};
