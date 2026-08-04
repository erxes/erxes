import { REMOVE_TICKETS } from '@/templates/graphql/mutations';
import { QUERY_TEMPLATES } from '@/templates/graphql/queries';
import { MutationHookOptions, useMutation } from '@apollo/client';

export const useRemoveTemplate = () => {
  const [_removeTemplate, { loading }] = useMutation(REMOVE_TICKETS, {
    refetchQueries: [QUERY_TEMPLATES],
  });

  const removeTemplate = async (
    templateIds: string[],
    options?: MutationHookOptions,
  ) => {
    await _removeTemplate({
      ...options,
      variables: { ...options?.variables, _ids: templateIds },
    });
  };

  return { removeTemplate, loading };
};
