import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  TECH_CARD_ADD,
  TECH_CARD_EDIT,
  TECH_CARD_REMOVE,
} from '../graphql/techCardMutations';

const withToast = (
  options: OperationVariables,
  successDescription: string,
  t: TFunction<'accounting'>,
) => ({
  ...options,
  onError: (error: Error) => {
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });
    options.onError?.(error);
  },
  onCompleted: (data: unknown) => {
    toast({
      title: t('success'),
      description: successDescription,
      variant: 'success',
    });
    options.onCompleted?.(data);
  },
});

export const useTechCardAdd = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(TECH_CARD_ADD, {
    refetchQueries: ['AccountingTechCards', 'AccountingTechCardOutputs'],
  });

  return {
    addTechCard: (options: OperationVariables) =>
      mutate(withToast(options, t('tech-card-added'), t)),
    loading,
  };
};

export const useTechCardEdit = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(TECH_CARD_EDIT, {
    refetchQueries: ['AccountingTechCards', 'AccountingTechCardOutputs'],
  });

  return {
    editTechCard: (options: OperationVariables) =>
      mutate(withToast(options, t('tech-card-updated'), t)),
    loading,
  };
};

export const useTechCardRemove = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(TECH_CARD_REMOVE, {
    refetchQueries: ['AccountingTechCards', 'AccountingTechCardOutputs'],
  });

  return {
    removeTechCard: (options: OperationVariables) =>
      mutate(withToast(options, t('tech-card-deleted'), t)),
    loading,
  };
};
