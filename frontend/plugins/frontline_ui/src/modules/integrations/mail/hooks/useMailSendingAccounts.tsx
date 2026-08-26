import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  MAIL_SENDING_ACCOUNTS_QUERY,
  MAIL_SENDING_READINESS_QUERY,
} from '../graphql/queries/mailSendingQueries';
import {
  MAIL_SENDING_ACCOUNT_ADD_MUTATION,
  MAIL_SENDING_ACCOUNT_REMOVE_MUTATION,
  MAIL_SENDING_ACCOUNT_VERIFY_MUTATION,
} from '../graphql/mutations/mailSendingMutations';

export type TMailSendingStatus = 'pending' | 'verified' | 'failed';

export interface IMailSendingDnsRecord {
  type: string;
  host: string;
  data: string;
  valid: boolean;
}

export interface IMailSendingAccount {
  _id: string;
  name: string;
  provider: string;
  domain: string;
  platformManaged: boolean;
  status: TMailSendingStatus;
  error?: string | null;
  verifiedAt?: string | null;
  dnsRecords?: IMailSendingDnsRecord[] | null;
}

export interface IMailSendingAccountInput {
  name: string;
  provider?: string;
  domain: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  sendgridApiKey?: string;
}

interface IMailSendingAccountsResponse {
  mailSendingAccounts: IMailSendingAccount[] | null;
}

export interface IMailSendingReadiness {
  ready: boolean;
  cloudflare: {
    ready: boolean;
    domain?: string | null;
    reason?: string | null;
  };
  platform: {
    ready: boolean;
    domain?: string | null;
  };
  accounts: IMailSendingAccount[];
}

interface IMailSendingReadinessResponse {
  mailSendingReadiness: IMailSendingReadiness | null;
}

export const useMailSendingReadiness = () => {
  const { data, loading } = useQuery<IMailSendingReadinessResponse>(
    MAIL_SENDING_READINESS_QUERY,
    { fetchPolicy: 'cache-and-network' },
  );

  return { readiness: data?.mailSendingReadiness ?? null, loading };
};

export const useMailSendingAccountActions = () => {
  const { t } = useTranslation('frontline');

  const onError = (error: { message?: string }) =>
    toast({
      title: t('mail-sending-account-failed'),
      description: error?.message,
      variant: 'destructive',
    });

  const [addAccount, { loading: adding }] = useMutation<{
    mailSendingAccountAdd: IMailSendingAccount | null;
  }>(MAIL_SENDING_ACCOUNT_ADD_MUTATION, {
    refetchQueries: [MAIL_SENDING_ACCOUNTS_QUERY, MAIL_SENDING_READINESS_QUERY],
    awaitRefetchQueries: true,
    onError,
  });

  const [verifyAccount, { loading: verifying }] = useMutation<{
    mailSendingAccountVerify: IMailSendingAccount | null;
  }>(MAIL_SENDING_ACCOUNT_VERIFY_MUTATION, {
    refetchQueries: [MAIL_SENDING_ACCOUNTS_QUERY, MAIL_SENDING_READINESS_QUERY],
    awaitRefetchQueries: true,
    onError,
  });

  const [removeAccount, { loading: removing }] = useMutation(
    MAIL_SENDING_ACCOUNT_REMOVE_MUTATION,
    {
      refetchQueries: [
        MAIL_SENDING_ACCOUNTS_QUERY,
        MAIL_SENDING_READINESS_QUERY,
      ],
      awaitRefetchQueries: true,
      onError,
    },
  );

  return {
    addAccount,
    adding,
    verifyAccount,
    verifying,
    removeAccount,
    removing,
  };
};

export const useMailSendingAccounts = () => {
  const actions = useMailSendingAccountActions();

  const { data, loading } = useQuery<IMailSendingAccountsResponse>(
    MAIL_SENDING_ACCOUNTS_QUERY,
    { fetchPolicy: 'cache-and-network' },
  );

  return {
    accounts: data?.mailSendingAccounts ?? [],
    loading,
    ...actions,
  };
};
