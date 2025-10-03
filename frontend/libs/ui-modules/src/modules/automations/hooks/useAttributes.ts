import { useQuery } from '@apollo/client';
import {
  FIELDS_COMBINED_BY_CONTENT_TYPE,
  groupFieldsByType,
} from 'ui-modules/modules/segments';

type QueryResponse = {
  fieldsCombinedByContentType: any[];
};

export const useAttributes = ({
  contentType,
  attrConfig,
  customAttributions,
}: {
  contentType: string;
  attrConfig: any;
  customAttributions?: any[];
}) => {
  const { data, loading } = useQuery<QueryResponse>(
    FIELDS_COMBINED_BY_CONTENT_TYPE,
    {
      variables: {
        contentType,
        config: attrConfig || undefined,
      },
    },
  );

  const { fieldsCombinedByContentType: fields = [] } = data || {};

  const groupAttributes = groupFieldsByType(
    (fields || []).concat(customAttributions || []),
  );

  return {
    loading,
    groupAttributes,
  };
};
