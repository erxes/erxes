import { useQuery } from '@apollo/client';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';
import { GET_DOCUMENTS } from '../graphql/queries';
import { DocumentFilterState } from '../types';

export const useDocuments = () => {
  const [{ createdAt, createdBy, contentType, searchValue, assignedTo }] =
    useMultiQueryState<DocumentFilterState & { assignedTo?: string | string[] | null }>([
      'createdAt',
      'createdBy',
      'contentType',
      'searchValue',
      'assignedTo', // Read for backward compatibility
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

  // Use createdBy if available, otherwise fall back to assignedTo for backward compatibility
  const userIds = createdBy || assignedTo;
  if (userIds) {
    variables['userIds'] = userIds;
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
