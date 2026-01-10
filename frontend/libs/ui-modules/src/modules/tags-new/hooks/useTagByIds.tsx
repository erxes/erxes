import { OperationVariables, useQuery } from '@apollo/client';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
import { TAG_BADGE_QUERY } from 'ui-modules/modules/tags-new/graphql/tagQueries';

export const useTagsByIds = (options: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    tagDetail: ITag;
  }>(TAG_BADGE_QUERY, {
    ...options,
  });

  const { tagDetail } = data || {};

  return {
    tagDetail,
    loading,
    error,
  };
};
