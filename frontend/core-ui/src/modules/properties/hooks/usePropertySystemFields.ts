import { useQuery } from '@apollo/client';
import { PROPERTY_SYSTEM_FIELDS_QUERY } from '../graphql/queries/propertiesQueries';
import { IPropertySystemField } from '../types/Properties';

export const usePropertySystemFields = (contentType: string) => {
  const { data, loading } = useQuery<{
    propertySystemFields: IPropertySystemField[];
  }>(PROPERTY_SYSTEM_FIELDS_QUERY, {
    variables: { contentType },
    skip: !contentType,
  });

  return {
    systemFields: data?.propertySystemFields || [],
    loading,
  };
};
