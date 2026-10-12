import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { MAIL_CHECK_CONNECTION_MUTATION } from '../graphql/mutations/mailMutations';
import type { MailCheckConnectionMutation } from '~/gql/graphql';

export type IMailConnectionCheck = NonNullable<
  MailCheckConnectionMutation['mailCheckConnection']
>;

export const useMailConnectionCheck = () => {
  const [mutate, { data, loading }] = useMutation(
    MAIL_CHECK_CONNECTION_MUTATION,
    {
      fetchPolicy: 'no-cache',
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    },
  );

  return {
    checkConnection: () => mutate(),
    result: data?.mailCheckConnection ?? undefined,
    loading,
  };
};
