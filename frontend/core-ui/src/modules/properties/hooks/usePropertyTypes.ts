import { useQuery } from '@apollo/client';
import { PROPERTY_TYPES_QUERY } from '../graphql/queries/propertiesQueries';
import { IPropertyType } from '../types/Properties';

export const usePropertyTypes = () => {
  const { data, loading, error } = useQuery(PROPERTY_TYPES_QUERY);

  return {
    propertyTypes: (data?.propertyTypes || {}) as Record<string, IPropertyType[]>,
    loading,
    error,
  };
};
