import { ApolloError, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_REMOVE } from '../graphql/adjustClosingRemove';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';

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
        navigate('/accounting/adjustment/closing');
        options?.onCompleted?.();
      },
      refetchQueries: [ADJUST_CLOSING_QUERY],
      awaitRefetchQueries: false,
    });
  };

  return {
    removeAdjust,
    loading,
  };
};
