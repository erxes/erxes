import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  GET_FACEBOOK_ACTIVITY,
  GET_FACEBOOK_BOTS,
  GET_FACEBOOK_PAGES,
  GET_FACEBOOK_POSTS,
  GET_FACEBOOK_SUMMARY,
} from '@/report/graphql/queries/getFacebookChart';
import { SYNC_FACEBOOK_POST_STATS } from '@/report/graphql/mutations/facebookReportMutations';
import type {
  ReportFacebookPagesQuery,
  ReportFacebookPagesQueryVariables,
  ReportFacebookSummaryQuery,
  ReportFacebookSummaryQueryVariables,
  ReportFacebookActivityQuery,
  ReportFacebookActivityQueryVariables,
  ReportFacebookPostsQuery,
  ReportFacebookPostsQueryVariables,
  ReportFacebookBotsQuery,
  ReportFacebookBotsQueryVariables,
} from '~/gql/graphql';

export const useFacebookPages = (
  options?: QueryHookOptions<
    ReportFacebookPagesQuery,
    ReportFacebookPagesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_FACEBOOK_PAGES, options);

  return {
    facebookPages: data?.reportFacebookPages?.filter(isDefined),
    loading,
    error,
  };
};

export const useFacebookSummary = (
  options: QueryHookOptions<
    ReportFacebookSummaryQuery,
    ReportFacebookSummaryQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_FACEBOOK_SUMMARY, options);

  return { facebookSummary: data?.reportFacebookSummary, loading, error };
};

export const useFacebookActivity = (
  options: QueryHookOptions<
    ReportFacebookActivityQuery,
    ReportFacebookActivityQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_FACEBOOK_ACTIVITY, options);

  return {
    facebookActivity: data?.reportFacebookActivity?.filter(isDefined),
    loading,
    error,
  };
};

export const useFacebookPosts = (
  options: QueryHookOptions<
    ReportFacebookPostsQuery,
    ReportFacebookPostsQueryVariables
  >,
) => {
  const { data, previousData, loading, error } = useQuery(
    GET_FACEBOOK_POSTS,
    options,
  );

  return {
    facebookPosts:
      data?.reportFacebookPosts ?? previousData?.reportFacebookPosts,
    loading,
    error,
  };
};

export const useFacebookBots = (
  options: QueryHookOptions<
    ReportFacebookBotsQuery,
    ReportFacebookBotsQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_FACEBOOK_BOTS, options);

  return {
    facebookBots: data?.reportFacebookBots?.filter(isDefined),
    loading,
    error,
  };
};

export const useSyncFacebookPostStats = () => {
  const [syncFacebookPostStats, { loading }] = useMutation(
    SYNC_FACEBOOK_POST_STATS,
    {
      refetchQueries: [GET_FACEBOOK_POSTS, GET_FACEBOOK_SUMMARY],
      awaitRefetchQueries: true,
    },
  );

  return { syncFacebookPostStats, syncing: loading };
};
