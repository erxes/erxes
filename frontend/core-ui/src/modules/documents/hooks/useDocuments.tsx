import { useQuery } from '@apollo/client';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { GET_DOCUMENTS } from '../graphql/queries';
import { DocumentFilterState } from '../types';

export const useDocuments = () => {
  const [{ createdAt, createdBy, contentType, searchValue }] =
    useMultiQueryState<DocumentFilterState>([
      'createdAt',
      'createdBy',
      'contentType',
      'searchValue',
    ]);

  const variables: Record<string, any> = {
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

  const { data, error, loading } = useQuery(GET_DOCUMENTS, {
    variables,
  });

  const documents = data?.documents?.list || [];

  return {
    documents,
    error,
    loading,
  };
};
