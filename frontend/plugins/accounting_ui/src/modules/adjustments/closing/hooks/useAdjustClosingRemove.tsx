import { ApolloError, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_REMOVE } from '../graphql/adjustClosingRemove';

export const useAdjustClosingEntryRemove = () => {
  const navigate = useNavigate();

  const [_removeMutation, { loading }] = useMutation(ADJUST_CLOSING_REMOVE);

  const removeAdjust = (
    _id: string,
    options?: {
      onError?: (e: ApolloError) => void;
      onCompleted?: () => void;
    },
  ) => {
    return _removeMutation({
      variables: { _id },
      onError: options?.onError,
      onCompleted: () => {
        options?.onCompleted?.();
        navigate('/accounting/adjustment/closing');
      },
    });
  };

  return {
    removeAdjust,
    loading,
  };
};
