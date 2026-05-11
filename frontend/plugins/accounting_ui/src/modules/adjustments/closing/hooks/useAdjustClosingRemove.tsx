import { ApolloError, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router';
import { ADJUST_CLOSING_REMOVE } from '../graphql/adjustClosingRemove';
import { ADJUST_CLOSING_QUERY } from '../graphql/adjustClosingQueries';
import { ACC_TRS__PER_PAGE } from '~/modules/transactions/types/constants';

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
      refetchQueries: [
        {
          query: ADJUST_CLOSING_QUERY,
          variables: {
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: false,
    });
  };

  return {
    removeAdjust,
    loading,
  };
};
