import { NetworkStatus, useApolloClient, useQuery } from '@apollo/client';
import { useCallback, useEffect, useRef } from 'react';
import { fileSettingsQueries } from '@/settings/file-upload/graphql';
import { useEmailSenderScope } from '@/settings/mail-config/contexts/EmailSenderScope';
import { FROM_DOMAIN_CHECK } from '@/settings/mail-config/graphql/verifiedSenders';

export type TFromDomainState =
  | 'verified'
  | 'pending'
  | 'failed'
  | 'missing'
  | 'unchecked';

export interface IFromDomainDnsRecord {
  type: string;
  host: string;
  data: string;
  valid: boolean;
}

export interface IFromDomainCheck {
  domain: string;
  region?: string | null;
  state: TFromDomainState;
  dnsRecords: IFromDomainDnsRecord[];
  error?: string | null;
  otherVerifiedDomains?: string[] | null;
  listError?: string | null;
}

interface ISavedConfig {
  _id: string;
  code: string;
  value: unknown;
}

export const useFromDomainCheck = () => {
  const scope = useEmailSenderScope();
  const client = useApolloClient();

  const { data: configsData } = useQuery<{ configs: ISavedConfig[] }>(
    fileSettingsQueries.GET_CONFIGS,
  );

  const savedConfigs = configsData?.configs;

  const { data, error, networkStatus, refetch } = useQuery<{
    emailSenderOptions: { fromDomain: IFromDomainCheck | null } | null;
  }>(FROM_DOMAIN_CHECK, {
    variables: { scope },
    // cached, it would replace the sender pickers' unkeyed emailSenderOptions
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    skip: !savedConfigs,
  });

  // a failed check surfaces through error
  const recheck = useCallback(
    () => refetch().catch(() => undefined),
    [refetch],
  );

  const checkedConfigs = useRef(savedConfigs);

  // saving refetches the configs; new credentials need a new answer
  useEffect(() => {
    if (checkedConfigs.current && checkedConfigs.current !== savedConfigs) {
      recheck();
    }

    checkedConfigs.current = savedConfigs;
  }, [savedConfigs, recheck]);

  // each check can open or close custom From; sender pickers must ask again
  useEffect(() => {
    if (data) {
      client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'emailSenderOptions' });
      client.cache.gc();
    }
  }, [data, client]);

  return {
    check: data?.emailSenderOptions?.fromDomain ?? null,
    error,
    loading: networkStatus === NetworkStatus.loading,
    rechecking: networkStatus === NetworkStatus.refetch,
    recheck,
  };
};
