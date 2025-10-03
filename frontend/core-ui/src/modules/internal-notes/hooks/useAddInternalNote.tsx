import { INTERNAL_NOTE_ADD } from '@/internal-notes/graphql/mutations/InternalNoteMutations';
import { OperationVariables, useMutation } from '@apollo/client';
export const useAddInternalNote = (options?: OperationVariables) => {
  const [addInternalNote, { loading, error }] = useMutation(
    INTERNAL_NOTE_ADD,
    options,
  );

  return {
    addInternalNote,
    loading,
    error,
  };
};
