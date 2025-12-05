import { useQuery } from '@apollo/client';
import { FIELD_GROUPS_QUERY } from '../graphql/queries/propertiesQueries';
import { IFieldGroup } from '../types/Properties';

export const useFieldGroups = ({ contentType }: { contentType: string }) => {
  const { data, loading } = useQuery<{ fieldGroups: { list: IFieldGroup[] } }>(
    FIELD_GROUPS_QUERY,
    {
      variables: {
        params: {
          contentType: contentType,
        },
      },
    },
  );
  return {
    fieldGroups: data?.fieldGroups?.list || [],
    loading,
  };
};
