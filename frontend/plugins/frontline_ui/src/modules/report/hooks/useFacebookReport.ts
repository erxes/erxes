import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  GET_FACEBOOK_ACTIVITY,
  GET_FACEBOOK_BOTS,
  GET_FACEBOOK_PAGES,
  GET_FACEBOOK_POSTS,
  GET_FACEBOOK_SUMMARY,
} from '@/report/graphql/queries/getFacebookChart';
import { SYNC_FACEBOOK_POST_STATS } from '@/report/graphql/mutations/facebookReportMutations';
import {
  FacebookActivityPoint,
  FacebookBotRow,
  FacebookPage,
  FacebookPostResult,
  FacebookSummary,
  FacebookSyncResult,
} from '@/report/types';

interface FacebookPagesResponse {
  reportFacebookPages: FacebookPage[];
}

interface FacebookSummaryResponse {
  reportFacebookSummary: FacebookSummary;
}

interface FacebookActivityResponse {
  reportFacebookActivity: FacebookActivityPoint[];
}

interface FacebookPostsResponse {
  reportFacebookPosts: FacebookPostResult;
}

interface FacebookBotsResponse {
  reportFacebookBots: FacebookBotRow[];
}

export const useFacebookPages = (
  options?: QueryHookOptions<FacebookPagesResponse>,
) => {
  const { data, loading, error } = useQuery<FacebookPagesResponse>(
    GET_FACEBOOK_PAGES,
    options,
  );

  return { facebookPages: data?.reportFacebookPages, loading, error };
};

export const useFacebookSummary = (
  options: QueryHookOptions<FacebookSummaryResponse>,
) => {
  const { data, loading, error } = useQuery<FacebookSummaryResponse>(
    GET_FACEBOOK_SUMMARY,
    options,
  );

  return { facebookSummary: data?.reportFacebookSummary, loading, error };
};

export const useFacebookActivity = (
  options: QueryHookOptions<FacebookActivityResponse>,
) => {
  const { data, loading, error } = useQuery<FacebookActivityResponse>(
    GET_FACEBOOK_ACTIVITY,
    options,
  );

  return { facebookActivity: data?.reportFacebookActivity, loading, error };
};

export const useFacebookPosts = (
  options: QueryHookOptions<FacebookPostsResponse>,
) => {
  const { data, loading, error } = useQuery<FacebookPostsResponse>(
    GET_FACEBOOK_POSTS,
    options,
  );

  return { facebookPosts: data?.reportFacebookPosts, loading, error };
};

export const useFacebookBots = (
  options: QueryHookOptions<FacebookBotsResponse>,
) => {
  const { data, loading, error } = useQuery<FacebookBotsResponse>(
    GET_FACEBOOK_BOTS,
    options,
  );

  return { facebookBots: data?.reportFacebookBots, loading, error };
};

interface FacebookSyncResponse {
  reportFacebookSyncPostStats: FacebookSyncResult;
}

export const useSyncFacebookPostStats = () => {
  const [syncFacebookPostStats, { loading }] = useMutation<
    FacebookSyncResponse,
    { pageIds?: string[]; limit?: number }
  >(SYNC_FACEBOOK_POST_STATS, {
    refetchQueries: [GET_FACEBOOK_POSTS, GET_FACEBOOK_SUMMARY],
    awaitRefetchQueries: true,
  });

  return { syncFacebookPostStats, syncing: loading };
};
