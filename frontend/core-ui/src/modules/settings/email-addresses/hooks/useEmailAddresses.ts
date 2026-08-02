import { EMAIL_ADDRESSES_CURSOR_SESSION_KEY } from '@/settings/email-addresses/constants';
import {
  EMAIL_ADDRESSES,
  EMAIL_ADDRESS_RELEASE,
} from '@/settings/email-addresses/graphql/queries';
import { IEmailAddress } from '@/settings/email-addresses/types';
import { useMutation, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  useRecordTableCursor,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useSearchParams } from 'react-router';

const PER_PAGE = 30;

export const useEmailAddresses = () => {
  const [searchParams] = useSearchParams();
  const { cursor } = useRecordTableCursor({
    sessionKey: EMAIL_ADDRESSES_CURSOR_SESSION_KEY,
  });

  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IEmailAddress>
  >(EMAIL_ADDRESSES, {
    variables: {
      cursor: cursor ?? undefined,
      limit: PER_PAGE,
      lane: searchParams.get('lane') || undefined,
      suppressionReason: searchParams.get('suppressionReason') || undefined,
      searchValue: searchParams.get('searchValue') || undefined,
    },
  });

  const { list = [], totalCount = 0, pageInfo } = data?.emailAddresses || {};

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
        limit: PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          emailAddresses: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.emailAddresses,
            prevResult: prev.emailAddresses,
          }),
        });
      },
    });
  };

  return {
    list,
    totalCount,
    loading,
    error,
    handleFetchMore,
    hasNextPage: pageInfo?.hasNextPage,
    hasPreviousPage: pageInfo?.hasPreviousPage,
  };
};

/**
 * Reopens an address that was closed. Refetches rather than patching the cache
 * because releasing usually moves the row out of the filter it was found under.
 */
export const useReleaseEmailAddress = () => {
  const { toast } = useToast();

  const [mutate, { loading }] = useMutation(EMAIL_ADDRESS_RELEASE, {
    refetchQueries: ['EmailAddresses'],
  });

  const release = (email: string, note: string) =>
    mutate({
      variables: { email, note },
      onCompleted: () =>
        toast({ title: `${email} can be mailed again`, variant: 'success' }),
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });

  return { release, loading };
};
