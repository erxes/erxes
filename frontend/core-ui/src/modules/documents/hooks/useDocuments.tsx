import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { GET_DOCUMENTS } from '../graphql/queries';
import { DocumentFilterState, IDocument } from '../types';

const DOCUMENTS_PER_PAGE = 20;

type DocumentsQueryResponse = {
  documents: {
    list?: IDocument[];
    pageInfo?: IRecordTableCursorPageInfo;
  };
};

export const useDocuments = () => {
  const [{ createdAt, createdBy, contentType, searchValue }] =
    useMultiQueryState<DocumentFilterState>([
      'createdAt',
      'createdBy',
      'contentType',
      'searchValue',
    ]);

  const variables: Record<string, unknown> = {
    limit: DOCUMENTS_PER_PAGE,
    orderBy: { createdAt: -1 },
  };

  if (contentType) {
    variables['contentType'] = contentType;
  }

  if (searchValue) {
    variables['searchValue'] = searchValue;
  }

  if (createdBy) {
    variables['userIds'] = createdBy;
  }

  if (createdAt) {
    variables['dateFilters'] = JSON.stringify({
      createdAt: {
        gte: parseDateRangeFromString(createdAt)?.from,
        lte: parseDateRangeFromString(createdAt)?.to,
      },
    });
  }

  const { data, error, loading, fetchMore } = useQuery<DocumentsQueryResponse>(
    GET_DOCUMENTS,
    {
      variables,
    },
  );

  const { list: documents = [], pageInfo } = data?.documents || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!pageInfo || !validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo.endCursor
            : pageInfo.startCursor,
        direction,
        limit: DOCUMENTS_PER_PAGE,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResult;
        }

        return {
          ...previousResult,
          documents: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.documents,
            prevResult: previousResult.documents,
          }),
        };
      },
    });
  };

  return {
    documents,
    error,
    loading,
    pageInfo,
    handleFetchMore,
  };
};
