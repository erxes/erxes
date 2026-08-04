import { useQuery } from '@apollo/client';
import { FIELD_GROUPS_QUERY } from '../graphql/fieldsQueries';
import { IFieldGroup } from '../types/fieldsTypes';

export const useFieldGroups = ({
  contentType,
  limit,
}: {
  contentType: string;
  limit?: number;
}) => {
  const { data, loading } = useQuery<{ fieldGroups: { list: IFieldGroup[] } }>(
    FIELD_GROUPS_QUERY,
    {
      variables: {
        params: {
          contentType: contentType,
          limit,
        },
      },
    },
  );
  return {
    fieldGroups: data?.fieldGroups?.list || [],
    loading,
  };
};
