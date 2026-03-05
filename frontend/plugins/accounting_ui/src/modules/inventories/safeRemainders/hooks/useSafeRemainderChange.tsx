import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  SAFE_REMAINDER_CANCEL,
  SAFE_REMAINDER_DO_TR,
  SAFE_REMAINDER_RECALC,
  SAFE_REMAINDER_SUBMIT,
  SAFE_REMAINDER_UNDO_TR,
} from '../graphql/safeRemainderChange';
import { SAFE_REMAINDER_DETAIL_QUERY } from '../graphql/safeRemainderQueries';

const commonOptions = (id: string, options?: any, _queryParams?: any) => {
  return {
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
    onCompleted: (data: any) => {
      toast({
        title: 'Success',
        description: 'Inventory safe remainder submited successfully',
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
    ],
  };
};

export const useSafeRemainderReCalc = () => {
  const [reCaclMutation, { loading }] = useMutation(SAFE_REMAINDER_RECALC);

  const reCalcSafeRemainder = (id: string, options?: OperationVariables) => {
    return reCaclMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, options),
    });
  };

  return {
    reCalcSafeRemainder,
    loading,
  };
};

export const useSafeRemainderSubmit = () => {
  const [submitMutation, { loading }] = useMutation(SAFE_REMAINDER_SUBMIT);

  const submitSafeRemainder = (id: string, options?: OperationVariables) => {
    return submitMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, options),
    });
  };

  return {
    submitSafeRemainder,
    loading,
  };
};

export const useSafeRemainderCancel = () => {
  const [cancelMutation, { loading }] = useMutation(SAFE_REMAINDER_CANCEL);

  const cancelSafeRemainder = (id: string, options?: OperationVariables) => {
    return cancelMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, options),
    });
  };

  return {
    cancelSafeRemainder,
    loading,
  };
};

export const useSafeRemainderDoTr = () => {
  const [doTrMutation, { loading }] = useMutation(SAFE_REMAINDER_DO_TR);

  const doTrSafeRemainder = (id: string, options?: OperationVariables) => {
    return doTrMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, options),
    });
  };

  return {
    doTrSafeRemainder,
    loading,
  };
};

export const useSafeRemainderUndoTr = () => {
  const [undoTrMutation, { loading }] = useMutation(SAFE_REMAINDER_UNDO_TR);

  const undoTrSafeRemainder = (id: string, options?: OperationVariables) => {
    return undoTrMutation({
      ...options,
      variables: {
        ...options?.variables,
        _id: id,
      },
      ...commonOptions(id, options),
    });
  };

  return {
    undoTrSafeRemainder,
    loading,
  };
};
