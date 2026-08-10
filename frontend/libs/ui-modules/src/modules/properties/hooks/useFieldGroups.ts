import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from '../graphql/fieldsQueries';
import { IFieldGroup } from '../types/fieldsTypes';

type FieldGroupsQueryResponse = {
  fieldGroups: {
    list: IFieldGroup[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
};

export const useFieldGroups = ({
  contentType,
  limit,
}: {
  contentType: string;
  limit?: number;
}) => {
  const { data, loading, fetchMore } = useQuery<FieldGroupsQueryResponse>(
    FIELD_GROUPS_QUERY,
    {
      variables: {
        params: {
          contentType,
          limit,
        },
      },
    },
  );

  const pageInfo = data?.fieldGroups?.pageInfo;

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

        return {
          ...prev,
          fieldGroups: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.fieldGroups,
              prevResult: prev.fieldGroups,
            }),
            totalCount: fetchMoreResult.fieldGroups.totalCount,
          },
        };
      },
    });
  };

  return {
    fieldGroups: data?.fieldGroups?.list || [],
    loading,
    handleFetchMore,
    pageInfo,
  };
};
