import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  ApolloError,
  MutationFunctionOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import type {
  AccountingJobAddMutation,
  AccountingJobAddMutationVariables,
  AccountingJobEditMutation,
  AccountingJobEditMutationVariables,
  AccountingJobRemoveMutation,
  AccountingJobRemoveMutationVariables,
} from '~/gql/graphql';
import { toast } from 'erxes-ui';
import { JOB_ADD, JOB_EDIT, JOB_REMOVE } from '../graphql/jobMutations';

const withToast = <TData, TVariables extends OperationVariables>(
  options: MutationFunctionOptions<TData, TVariables>,
  successDescription: string,
  t: TFunction<'accounting'>,
) => ({
  ...options,
  onError: (error: ApolloError) => {
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });
    options.onError?.(error);
  },
  onCompleted: (data: TData) => {
    toast({
      title: t('success'),
      description: successDescription,
      variant: 'success',
    });
    options.onCompleted?.(data);
  },
});

export const useJobAdd = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(JOB_ADD, {
    refetchQueries: ['AccountingJobs', 'AccountingJobOutputs'],
  });

  return {
    addJob: (
      options: MutationFunctionOptions<
        AccountingJobAddMutation,
        AccountingJobAddMutationVariables
      >,
    ) => mutate(withToast(options, t('job-added'), t)),
    loading,
  };
};

export const useJobEdit = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(JOB_EDIT, {
    refetchQueries: ['AccountingJobs', 'AccountingJobOutputs'],
  });

  return {
    editJob: (
      options: MutationFunctionOptions<
        AccountingJobEditMutation,
        AccountingJobEditMutationVariables
      >,
    ) => mutate(withToast(options, t('job-updated'), t)),
    loading,
  };
};

export const useJobRemove = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(JOB_REMOVE, {
    refetchQueries: ['AccountingJobs', 'AccountingJobOutputs'],
  });

  return {
    removeJob: (
      options: MutationFunctionOptions<
        AccountingJobRemoveMutation,
        AccountingJobRemoveMutationVariables
      >,
    ) => mutate(withToast(options, t('job-deleted'), t)),
    loading,
  };
};
