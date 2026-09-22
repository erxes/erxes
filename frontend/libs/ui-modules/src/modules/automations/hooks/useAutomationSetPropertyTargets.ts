import { useQuery } from '@apollo/client';
import { AUTOMATION_SET_PROPERTY_TARGETS } from '../graphql/fieldQueries';

export type TAutomationPropertyTypeOption = {
  value: string;
  label?: string;
  description?: string;
  type?: string;
  source?: 'target' | 'relation' | 'resolver' | 'targetField';
  cardinality?: 'one' | 'many';
  sourceType?: string;
  relation?: { contentType: string; relatedContentType: string };
  resolverKey?: string;
  targetPath?: string;
  pluginName?: string;
};

type TSetPropertyTargetsQueryResponse = {
  automationSetPropertyTargets?: TAutomationPropertyTypeOption[];
};

export const useAutomationSetPropertyTargets = (sourceType?: string) => {
  const { data, loading } = useQuery<TSetPropertyTargetsQueryResponse>(
    AUTOMATION_SET_PROPERTY_TARGETS,
    {
      variables: { sourceType },
      skip: !sourceType,
    },
  );

  return {
    propertyTypes: data?.automationSetPropertyTargets || [],
    loading,
  };
};
