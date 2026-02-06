import { useMutation } from '@apollo/client';
import { FORM_REMOVE } from '../graphql/formMutations';
import { GET_FORMS_LIST } from '../graphql/formQueries';

export const useRemoveForm = () => {
  const [_remove, { loading }] = useMutation(FORM_REMOVE);

  const removeForm = async (formIds: string[]) => {
    await Promise.all(
      formIds.map(async (formId) => {
        await _remove({
          variables: { id: formId },
          refetchQueries: [GET_FORMS_LIST],
        });
      }),
    );
  };

  return {
    removeForm,
    loading,
  };
};
