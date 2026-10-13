import { useQuery } from '@apollo/client';
import { templatesQuery } from '../graphql/queries';
import { compactList } from '@/operation/utils/cursorList';

export const useTemplates = ({ teamId }: { teamId?: string }) => {
  const { data, loading, error } = useQuery(templatesQuery, {
    variables: { teamId },
    skip: !teamId,
  });

  return {
    templates: compactList(data?.operationTemplates),
    loading,
    error,
  };
};
