import { useMutation } from '@apollo/client';
import { REMOVE_ELEMENT } from '../graphql/mutation';

export const useRemoveElements = () => {
  const [removeElementsMutation, { loading }] = useMutation(
    REMOVE_ELEMENT,
    {
      refetchQueries: ['BmsElements'],
      awaitRefetchQueries: true,
    },
  );

  const removeElements = async (ids: string[]) => {
    return removeElementsMutation({
      variables: { ids },
    });
  };

  return {
    removeElements,
    loading,
  };
};
