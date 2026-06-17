import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import {
  AUTOMATION_PROPERTIES_WITH_FIELDS,
  PROPERTIES_WITH_FIELDS,
} from '../graphql/queries';
import { FieldQueryResponse } from '../types';

type TGetFieldsPropertiesOptions = {
  source?: 'segments' | 'automations';
  sourceType?: string;
};

export const useGetFieldsProperties = (
  propertyType?: string,
  options: TGetFieldsPropertiesOptions = {},
) => {
  const [contentType] = useQueryState<string>('contentType');
  const queryContentType = propertyType || contentType;
  const isAutomationSource = options.source === 'automations';
  const sourceType = options.sourceType || queryContentType;
  const query = isAutomationSource
    ? AUTOMATION_PROPERTIES_WITH_FIELDS
    : PROPERTIES_WITH_FIELDS;

  const { data, loading } = useQuery<FieldQueryResponse>(query, {
    variables: { contentType: queryContentType, sourceType },
    skip: !queryContentType || (isAutomationSource && !sourceType),
  });

  const {
    fieldsCombinedByContentType = [],
    segmentsGetAssociationTypes = [],
    automationSetPropertyTargets = [],
  } = data || {};

  return {
    fields: fieldsCombinedByContentType,
    propertyTypes: isAutomationSource
      ? automationSetPropertyTargets
      : segmentsGetAssociationTypes,
    loading,
  };
};
