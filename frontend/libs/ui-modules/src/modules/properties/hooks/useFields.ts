import { useQuery } from '@apollo/client';
import { FIELDS_QUERY } from '../graphql/fieldsQueries';
import { ICursorListResponse } from 'erxes-ui';
import { IField } from '../types/fieldsTypes';

export const useFields = ({
  groupId,
  contentType,
}: {
  groupId?: string;
  contentType: string;
}) => {
  const { data, loading } = useQuery<ICursorListResponse<IField>>(
    FIELDS_QUERY,
    {
      variables: {
        params: {
          groupId,
          contentType,
        },
      },
    },
  );

  return {
    fields: data?.fields?.list || [],
    loading,
  };
};
