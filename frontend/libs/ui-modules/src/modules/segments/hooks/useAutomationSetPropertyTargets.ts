import { useQuery } from '@apollo/client';
import { AUTOMATION_SET_PROPERTY_TARGETS } from '../graphql/queries';
import { TPropertyTypeOption } from '../types';

type TSetPropertyTargetsQueryResponse = {
  automationSetPropertyTargets?: TPropertyTypeOption[];
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
