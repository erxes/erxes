import { useQuery } from '@apollo/client';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { GET_DOCUMENTS } from '../graphql/queries';
import { DocumentFilterState } from '../types';

export const useDocuments = () => {
  const [{ createdAt, assignedTo, contentType, searchValue }] =
    useMultiQueryState<DocumentFilterState>([
      'createdAt',
      'assignedTo',
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

  if (assignedTo) {
    variables['userIds'] = assignedTo;
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
