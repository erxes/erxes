import { useMutation, useQuery } from '@apollo/client';
import { LDAP_CONFIG } from '@/settings/ldap/graphql/queries';
import {
  LDAP_CONFIG_SAVE,
  LDAP_RECHECK_NOW,
  LDAP_TEST_CONNECTION,
} from '@/settings/ldap/graphql/mutations';
import {
  ILdapConfig,
  ILdapConfigInput,
  ILdapTestResult,
} from '@/settings/ldap/types';

export const useLdapConfig = () => {
  const { data, loading, error } = useQuery<{
    authLdapConfig: ILdapConfig | null;
  }>(LDAP_CONFIG);

  return { config: data?.authLdapConfig ?? null, loading, error };
};

export const useLdapConfigSave = () => {
  const [save, { loading }] = useMutation<
    { authLdapConfigSave: ILdapConfig },
    { input: ILdapConfigInput }
  >(LDAP_CONFIG_SAVE, {
    update: (cache, { data }) => {
      if (!data?.authLdapConfigSave) return;

      cache.writeQuery({
        query: LDAP_CONFIG,
        data: { authLdapConfig: data.authLdapConfigSave },
      });
    },
  });

  return { save, loading };
};

// Refetching keeps the whole config (and form) in step with the run's result
export const useLdapRecheckNow = () => {
  const [recheck, { loading }] = useMutation<{
    authLdapRecheckNow: Pick<
      ILdapConfig,
      'lastRecheck' | 'nextRecheckAt' | 'recheckChanges'
    > | null;
  }>(LDAP_RECHECK_NOW, {
    refetchQueries: [LDAP_CONFIG],
    awaitRefetchQueries: true,
  });

  return { recheck, loading };
};

export const useLdapTestConnection = () => {
  const [test, { data, loading, reset }] = useMutation<
    { authLdapTestConnection: ILdapTestResult },
    { input: ILdapConfigInput; identifier?: string }
  >(LDAP_TEST_CONNECTION);

  return {
    test,
    result: data?.authLdapTestConnection ?? null,
    loading,
    reset,
  };
};
