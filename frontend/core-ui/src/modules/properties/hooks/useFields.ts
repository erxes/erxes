import { useQuery } from '@apollo/client';
import { FIELDS_QUERY } from '../graphql/queries/propertiesQueries';
import { ICursorListResponse } from 'erxes-ui';
import { IField } from 'ui-modules';

export const useFields = ({
  groupId,
  contentType,
}: {
  groupId: string;
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
