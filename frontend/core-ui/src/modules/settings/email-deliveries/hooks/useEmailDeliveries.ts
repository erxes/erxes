import {
  EMAIL_DELIVERIES,
  EMAIL_DELIVERY_DETAIL,
} from '@/settings/email-deliveries/graphql/queries';
import { EMAIL_DELIVERIES_CURSOR_SESSION_KEY } from '@/settings/email-deliveries/constants';
import {
  IEmailDelivery,
  IEmailDeliveryRow,
} from '@/settings/email-deliveries/types';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  parseDateRangeFromString,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSearchParams } from 'react-router';

const PER_PAGE = 30;

export const useEmailDeliveries = () => {
  const [searchParams] = useSearchParams();
  const { cursor } = useRecordTableCursor({
    sessionKey: EMAIL_DELIVERIES_CURSOR_SESSION_KEY,
  });

  const createdAtRange = parseDateRangeFromString(
    searchParams.get('createdAt'),
  );

  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IEmailDeliveryRow>
  >(EMAIL_DELIVERIES, {
    variables: {
      cursor: cursor ?? undefined,
      limit: PER_PAGE,
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      provider: searchParams.get('provider') || undefined,
      searchValue: searchParams.get('searchValue') || undefined,
      createdAtFrom: createdAtRange?.from,
      createdAtTo: createdAtRange?.to,
    },
  });

  const { list = [], totalCount = 0, pageInfo } = data?.emailDeliveries || {};

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
          emailDeliveries: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.emailDeliveries,
            prevResult: prev.emailDeliveries,
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

export const useEmailDeliveryDetail = (id: string) => {
  const { data, loading, error } = useQuery<{
    emailDeliveryDetail: IEmailDelivery;
  }>(EMAIL_DELIVERY_DETAIL, { variables: { id } });

  return { detail: data?.emailDeliveryDetail, loading, error };
};
