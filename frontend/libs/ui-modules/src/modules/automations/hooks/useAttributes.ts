import { useQuery } from '@apollo/client';
import {
  FIELDS_COMBINED_BY_CONTENT_TYPE,
  groupFieldsByType,
} from 'ui-modules/modules/segments';

type QueryResponse = {
  fieldsCombinedByContentType: any[];
};
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export const useAttributes = ({
  contentType,
  attributesConfig,
  additionalAttributes,
  attributeTypes,
}: {
  contentType?: string;
  attributesConfig?: any;
  additionalAttributes?: any[];
  attributeTypes?: string[];
}) => {
  const { data, loading } = useQuery<QueryResponse>(
    FIELDS_COMBINED_BY_CONTENT_TYPE,
    {
      variables: {
        contentType,
        config: attributesConfig || undefined,
      },
      skip: !contentType,
    },
  );

  let { fieldsCombinedByContentType: fields = [] } = data || {};

  if (attributeTypes?.length) {
    fields = fields.filter(
      ({ type, validation = '' }) =>
        attributeTypes.includes(type) ||
        attributeTypes.includes(capitalizeFirstLetter(validation)),
    );
  }

  if (additionalAttributes?.length) {
    fields = (fields || []).concat(additionalAttributes || []);
  }

  const groupAttributes = groupFieldsByType(fields);

  return {
    loading,
    groupAttributes,
    attributes: fields,
  };
};
