import { useQuery } from '@apollo/client';
import { templatesQuery } from '../graphql/queries';
import { IOperationTemplate } from '../types';

export const useTemplates = ({  teamId }: { teamId?: string }) => {
  const { data, loading, error } = useQuery(templatesQuery, {
    variables: { teamId },
    skip: !teamId,
  });

  return {
    templates: (data?.operationTemplates || []) as IOperationTemplate[],
    loading,
    error,
  };
};
