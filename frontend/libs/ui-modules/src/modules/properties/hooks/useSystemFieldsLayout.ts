import { useQuery } from '@apollo/client';
import { PROPERTY_SYSTEM_FIELDS_LAYOUT_QUERY } from '../graphql/systemFieldsLayoutQueries';
import { readLayout } from '../utils/groupLayout';

// Rows of system field codes; null when the content type has no layout.
export const useSystemFieldsLayout = (contentType: string) => {
  const { data, loading } = useQuery<{
    propertySystemFieldsLayout: string[][] | null;
  }>(PROPERTY_SYSTEM_FIELDS_LAYOUT_QUERY, {
    variables: { contentType },
    fetchPolicy: 'cache-and-network',
  });

  return {
    layout: readLayout(data?.propertySystemFieldsLayout),
    loading: loading && !data,
  };
};
