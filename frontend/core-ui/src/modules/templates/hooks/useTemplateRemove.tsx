import { MutationHookOptions, useMutation } from '@apollo/client';
import { REMOVE_TICKETS } from '../graphql/mutations';
import { QUERY_TEMPLATES } from '../graphql/queries';

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
      variables: { _ids: templateIds, ...options?.variables },
    });
  };

  return { removeTemplate, loading };
};
