import { MutationHookOptions, useMutation } from '@apollo/client';

import { tagsAdd } from '../graphql/mutations/tagsMutations';

export const useTagsAdd = () => {
  const [addTag, { loading }] = useMutation(tagsAdd);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addTag({
      ...options,
      variables,
      refetchQueries: ['Tags'],
    });
  };

  return {
    addTag: mutate,
    loading,
  };
};
