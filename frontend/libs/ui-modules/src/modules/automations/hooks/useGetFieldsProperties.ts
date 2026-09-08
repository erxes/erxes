import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { IField } from '../../properties/types/fieldsTypes';
import {
  AUTOMATION_PROPERTIES_WITH_FIELDS,
  FIELDS_COMBINED_BY_CONTENT_TYPE,
} from '../graphql/fieldQueries';
import { TAutomationPropertyTypeOption } from './useAutomationSetPropertyTargets';

type TGetFieldsPropertiesOptions = {
  source?: 'segments' | 'automations';
  sourceType?: string;
};

/**
 * `fieldsCombinedByContentType` is a JSON field, and for automations it carries
 * more than the stored property definition: a display label, the owning group's
 * detail, and validation narrowed to the flags the rule editor branches on.
 */
export type TAutomationField = IField & {
  label?: string;
  groupDetail?: { _id?: string; name?: string; code?: string };
  validation?: string | { number?: boolean; date?: boolean };
};

type TFieldsPropertiesQueryResponse = {
  fieldsCombinedByContentType?: TAutomationField[];
  automationSetPropertyTargets?: TAutomationPropertyTypeOption[];
};

/**
 * Field catalog for a content type, with the automation property targets when
 * the caller is an automation: both come back in one request so the rule
 * editor never renders against a half-loaded pair.
 */
export const useGetFieldsProperties = (
  propertyType?: string,
  options: TGetFieldsPropertiesOptions = {},
) => {
  const [contentType] = useQueryState<string>('contentType');
  const queryContentType = propertyType || contentType;
  const isAutomationSource = options.source === 'automations';
  const sourceType = options.sourceType || queryContentType;

  const { data, loading } = useQuery<TFieldsPropertiesQueryResponse>(
    isAutomationSource
      ? AUTOMATION_PROPERTIES_WITH_FIELDS
      : FIELDS_COMBINED_BY_CONTENT_TYPE,
    {
      variables: isAutomationSource
        ? { contentType: queryContentType, sourceType }
        : { contentType: queryContentType },
      skip: !queryContentType || (isAutomationSource && !sourceType),
    },
  );

  return {
    fields: data?.fieldsCombinedByContentType || [],
    propertyTypes: data?.automationSetPropertyTargets || [],
    loading,
  };
};
