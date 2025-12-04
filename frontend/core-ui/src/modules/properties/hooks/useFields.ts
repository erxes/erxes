import { useQuery } from '@apollo/client';
import { FIELDS_QUERY } from '../graphql/queries/propertiesQueries';

export const useFields = ({ contentType }: { contentType: string }) => {
  const { data, loading } = useQuery(FIELDS_QUERY, {
    variables: {
      params: {
        contentType: contentType,
      },
    },
  });
};
