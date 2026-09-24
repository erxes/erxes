import { EMAIL_TEMPLATES } from '@/emailTemplates/graphql/queries';
import { IEmailTemplatesListResponse } from '@/emailTemplates/types';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';

const EMAIL_TEMPLATES_LIMIT = 30;

/** A picker searches on its own; the list page searches through its filter. */
type TEmailTemplatesSearch = { searchValue?: string };

export const useEmailTemplatesVariables = (
  override?: TEmailTemplatesSearch,
) => {
  const [{ searchValue }] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);

  return {
    searchValue: (override ? override.searchValue : searchValue) || undefined,
    limit: EMAIL_TEMPLATES_LIMIT,
    orderBy: { createdAt: -1 },
  };
};

export const useEmailTemplates = (override?: TEmailTemplatesSearch) => {
  const variables = useEmailTemplatesVariables(override);

  const { data, loading, error, refetch, fetchMore } = useQuery<{
    emailTemplates: IEmailTemplatesListResponse;
  }>(EMAIL_TEMPLATES, { variables });

  const {
    list: emailTemplates = [],
    totalCount = 0,
    pageInfo,
  } = data?.emailTemplates || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: EMAIL_TEMPLATES_LIMIT,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          emailTemplates: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.emailTemplates,
            prevResult: prev.emailTemplates,
          }),
        });
      },
    });
  };

  return {
    emailTemplates,
    totalCount,
    pageInfo,
    loading,
    error,
    refetch,
    handleFetchMore,
  };
};
