import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';

export const useTrRecordsRemove = (
  options?: GraphqlMutationOptions<typeof ACC_TRANSACTIONS_REMOVE>,
) => {
  const { t } = useTranslation('accounting');
  const { toast } = useToast();
  const [_removeTrRecords, { loading, client }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
    options,
  );

  const removeTrRecords = async (parentIds: Array<string | undefined>) => {
    const results = await Promise.allSettled(
      parentIds.map((parentId) =>
        _removeTrRecords({ variables: { parentId } }),
      ),
    );
    const errors: string[] = results.flatMap((result) =>
      result.status === 'rejected' ? [result.reason.message] : [],
    );

    client.refetchQueries({ include: ['accountingAccTrRecords'] });

    if (!errors.length) {
      toast({
        title: t('success'),
        description: t('tr-record-deleted-successfully'),
      });

      return [];
    }

    const messages = Array.from(new Set(errors));

    if (errors.length < parentIds.length) {
      messages.push(t('tr-record-deleted-successfully'));
    }

    toast({
      title: t('error'),
      description: messages.map((message) => (
        <div key={message}>{message}</div>
      )),
      variant: 'destructive',
    });

    return parentIds.filter((_, index) => results[index].status === 'rejected');
  };

  return {
    removeTrRecords,
    loading,
  };
};
