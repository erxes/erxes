import { OperationVariables, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_ENTRY_REMOVE } from '../graphql/adjustClosingRemove';

export const useAdjustClosingEntryRemove = (options?: OperationVariables) => {
  const navigate = useNavigate();

  const [_removeMutation, { loading }] = useMutation(
    ADJUST_CLOSING_ENTRY_REMOVE,
    options,
  );

  const removeAdjust = (
    adjustClosingIds: string[],
    options?: OperationVariables,
  ) => {
    return _removeMutation({
      ...options,
      variables: {
        adjustClosingIds,
        ...options?.variables,
      },
      onCompleted: () => {
        navigate('/accounting/adjustment/closing');
      },
    });
  };

  return {
    removeAdjust,
    loading,
  };
};
