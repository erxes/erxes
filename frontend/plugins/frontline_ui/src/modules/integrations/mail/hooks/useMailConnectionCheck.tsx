import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { MAIL_CHECK_CONNECTION_MUTATION } from '../graphql/mutations/mailMutations';

export interface IMailConnectionCheck {
  ok: boolean;
  tenant: string;
  endpoint?: string | null;
  error?: string | null;
}

interface MailConnectionCheckResponse {
  mailCheckConnection: IMailConnectionCheck;
}

export const useMailConnectionCheck = () => {
  const [mutate, { data, loading }] = useMutation<MailConnectionCheckResponse>(
    MAIL_CHECK_CONNECTION_MUTATION,
    {
      fetchPolicy: 'no-cache',
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    },
  );

  return {
    checkConnection: () => mutate(),
    result: data?.mailCheckConnection,
    loading,
  };
};
