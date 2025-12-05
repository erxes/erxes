import { useQuery } from '@apollo/client';
import { FIELD_DETAILS_QUERY } from '../graphql/queries/propertiesQueries';

export const useFieldDetail = ({ id }: { id: string }) => {
  const { data, loading, error } = useQuery(FIELD_DETAILS_QUERY, {
    variables: { id },
    skip: !id,
  });
  const fieldDetail = data?.fieldDetail || null;
  return { fieldDetail, loading, error };
};
