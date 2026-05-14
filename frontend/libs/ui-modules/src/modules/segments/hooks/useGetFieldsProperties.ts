import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { PROPERTIES_WITH_FIELDS } from '../graphql/queries';
import { FieldQueryResponse } from '../types';

export const useGetFieldsProperties = (propertyType?: string) => {
  const [contentType] = useQueryState<string>('contentType');

  const { data, loading } = useQuery<FieldQueryResponse>(
    PROPERTIES_WITH_FIELDS,
    {
      variables: { contentType: propertyType || contentType },
      skip: !contentType && !propertyType,
    },
  );

  const { fieldsCombinedByContentType = [], segmentsGetAssociationTypes = [] } =
    data || {};

  return {
    fields: fieldsCombinedByContentType,
    propertyTypes: segmentsGetAssociationTypes,
    loading,
  };
};
