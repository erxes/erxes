import { ApolloError, useMutation } from '@apollo/client';
import { CP_USERS_VERIFY } from '../graphql/cpUsersVerify';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface CPUsersVerifyResult {
  clientPortalUsersVerify: {
    success: boolean;
  };
}

export interface CPUsersVerifyOptions {
  variables: {
    type: 'email' | 'phone';
    userIds: string[];
  };
  onError?: (error: ApolloError) => void;
  onCompleted?: (data: CPUsersVerifyResult) => void;
}

export function useCPUsersVerify() {
  const { toast } = useToast();
  const { t } = useTranslation('contact');

  const [cpUsersVerifyMutation, { loading }] = useMutation<CPUsersVerifyResult>(
    CP_USERS_VERIFY,
    {
      refetchQueries: ['getClientPortalUsers'],
    },
  );

  const cpUsersVerify = (options: CPUsersVerifyOptions) => {
    return cpUsersVerifyMutation({
      variables: options.variables,
      onError: (error) => {
        toast({
          title: t('error', { defaultValue: 'Error' }),
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success', { defaultValue: 'Success' }),
          description: t('clientPortalUser.verify.success', {
            defaultValue: 'Users successfully verified',
          }),
          variant: 'success',
        });
        options.onCompleted?.(data);
      },
    });
  };

  return { cpUsersVerify, loading };
}
