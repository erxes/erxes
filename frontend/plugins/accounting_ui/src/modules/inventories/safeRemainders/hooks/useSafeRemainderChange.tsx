import {
  ApolloError,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { toast } from 'erxes-ui';
import i18n from 'i18next';
import {
  SAFE_REMAINDER_CANCEL,
  SAFE_REMAINDER_DO_TR,
  SAFE_REMAINDER_RECALC,
  SAFE_REMAINDER_SUBMIT,
  SAFE_REMAINDER_UNDO_TR,
} from '../graphql/safeRemainderChange';
import {
  SAFE_REMAINDER_DETAIL_QUERY,
  SAFE_REMAINDER_DETAILS_QUERY,
} from '../graphql/safeRemainderQueries';

type SafeRemainderMutationData = Record<string, unknown>;
type SafeRemainderMutationOptions = Pick<
  MutationFunctionOptions<SafeRemainderMutationData>,
  'onCompleted' | 'onError'
> & {
  variables?: { page?: number; perPage?: number };
};

const commonOptions = (
  id: string,
  successMessage: string,
  options?: SafeRemainderMutationOptions,
) => {
  return {
    onError: (error: ApolloError) => {
      toast({
        title: i18n.t('accounting:error'),
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
    onCompleted: (data: SafeRemainderMutationData) => {
      toast({
        title: i18n.t('accounting:success'),
        description: i18n.t(`accounting:${successMessage}`),
      });
      options?.onCompleted?.(data);
    },
    refetchQueries: [
      {
        query: SAFE_REMAINDER_DETAIL_QUERY,
        variables: {
          _id: id,
        },
      },
      {
        query: SAFE_REMAINDER_DETAILS_QUERY,
        variables: {
          remainderId: id,
          ...options?.variables,
        },
      },
    ],
  };
};

export const useSafeRemainderReCalc = () => {
  const [reCaclMutation, { loading }] = useMutation(SAFE_REMAINDER_RECALC);

  const reCalcSafeRemainder = (
    id: string,
    options?: SafeRemainderMutationOptions,
  ) => {
    return reCaclMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, 'safe-remainder-updated', options),
    });
  };

  return {
    reCalcSafeRemainder,
    loading,
  };
};

export const useSafeRemainderSubmit = () => {
  const [submitMutation, { loading }] = useMutation(SAFE_REMAINDER_SUBMIT);

  const submitSafeRemainder = (
    id: string,
    options?: SafeRemainderMutationOptions,
  ) => {
    return submitMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, 'safe-remainder-submitted', options),
    });
  };

  return {
    submitSafeRemainder,
    loading,
  };
};

export const useSafeRemainderCancel = () => {
  const [cancelMutation, { loading }] = useMutation(SAFE_REMAINDER_CANCEL);

  const cancelSafeRemainder = (
    id: string,
    options?: SafeRemainderMutationOptions,
  ) => {
    return cancelMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, 'safe-remainder-updated', options),
    });
  };

  return {
    cancelSafeRemainder,
    loading,
  };
};

export const useSafeRemainderDoTr = () => {
  const [doTrMutation, { loading }] = useMutation(SAFE_REMAINDER_DO_TR);

  const doTrSafeRemainder = (
    id: string,
    options?: SafeRemainderMutationOptions,
  ) => {
    return doTrMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, 'safe-remainder-updated', options),
    });
  };

  return {
    doTrSafeRemainder,
    loading,
  };
};

export const useSafeRemainderUndoTr = () => {
  const [undoTrMutation, { loading }] = useMutation(SAFE_REMAINDER_UNDO_TR);

  const undoTrSafeRemainder = (
    id: string,
    options?: SafeRemainderMutationOptions,
  ) => {
    return undoTrMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, 'safe-remainder-updated', options),
    });
  };

  return {
    undoTrSafeRemainder,
    loading,
  };
};
