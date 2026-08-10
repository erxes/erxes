import { useQuery } from '@apollo/client';
import { FIELDS_QUERY } from '../graphql/fieldsQueries';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IField } from '../types/fieldsTypes';

export const useFields = ({
  groupId,
  contentType,
  limit,
}: {
  groupId?: string;
  contentType: string;
  limit?: number;
}) => {
  const { data, loading, refetch, fetchMore } = useQuery<
    ICursorListResponse<IField>
  >(FIELDS_QUERY, {
    variables: {
      params: {
        groupId,
        contentType,
        limit,
      },
    },
  });

  const pageInfo = data?.fields?.pageInfo;

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
        params: {
          groupId,
          contentType,
          limit,
          direction,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return Object.assign({}, prev, {
          fields: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.fields,
            prevResult: prev.fields,
          }),
        });
      },
    });
  };

  const fields = (data?.fields?.list || []).map((field) => {
    const type = field.type?.startsWith('relation:') ? 'relation' : field.type;
    const relationType =
      type === 'relation' ? field.type?.replace('relation:', '') : undefined;

    const isLogicRules = Array.isArray(field.logics);

    const logics = isLogicRules
      ? field.logics
      : Object.fromEntries(
          Object.entries(field.logics || {}).filter(
            ([key]) => key !== 'multiple',
          ),
        );

    const multiple = isLogicRules
      ? undefined
      : (field.logics as { multiple?: boolean } | undefined)?.multiple;

    return {
      ...field,
      type,
      relationType,
      logics,
      multiple,
    };
  });

  return {
    fields: fields,
    totalCount: data?.fields?.totalCount || 0,
    loading,
    refetch,
    handleFetchMore,
    pageInfo,
  };
};
