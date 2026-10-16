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
) => ({
  ...options,
  onError: (error: Error) => {
    toast({
      title: 'Алдаа',
      description: error.message,
      variant: 'destructive',
    });
    options.onError?.(error);
  },
  onCompleted: (data: unknown) => {
    toast({
      title: 'Амжилттай',
      description: successDescription,
      variant: 'success',
    });
    options.onCompleted?.(data);
  },
});

export const useTechCardAdd = () => {
  const [mutate, { loading }] = useMutation(TECH_CARD_ADD, {
    refetchQueries: ['AccountingTechCards', 'AccountingTechCardOutputs'],
  });

  return {
    addTechCard: (options: OperationVariables) =>
      mutate(withToast(options, 'Технологийн карт нэмэгдлээ')),
    loading,
  };
};

export const useTechCardEdit = () => {
  const [mutate, { loading }] = useMutation(TECH_CARD_EDIT, {
    refetchQueries: ['AccountingTechCards', 'AccountingTechCardOutputs'],
  });

  return {
    editTechCard: (options: OperationVariables) =>
      mutate(withToast(options, 'Технологийн карт шинэчлэгдлээ')),
    loading,
  };
};

export const useTechCardRemove = () => {
  const [mutate, { loading }] = useMutation(TECH_CARD_REMOVE, {
    refetchQueries: ['AccountingTechCards', 'AccountingTechCardOutputs'],
  });

  return {
    removeTechCard: (options: OperationVariables) =>
      mutate(withToast(options, 'Технологийн карт устгагдлаа')),
    loading,
  };
};
