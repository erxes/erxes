import { useMutation, MutationFunctionOptions } from '@apollo/client';
import { ADD_RESPONSE } from '@/responseTemplate/graphql/mutations/addResponse';
import type {
  ResponseTemplatesAddMutation,
  ResponseTemplatesAddMutationVariables,
} from '~/gql/graphql';
export const useResponseAdd = () => {
  const [_addResponse, { loading, error }] = useMutation(ADD_RESPONSE);

  const addResponse = (
    options: MutationFunctionOptions<
      ResponseTemplatesAddMutation,
      ResponseTemplatesAddMutationVariables
    >,
  ) => {
    return _addResponse({
      ...options,
      refetchQueries: ['ResponseTemplates'],
    });
  };

  return {
    addResponse,
    loading,
    error,
  };
};
