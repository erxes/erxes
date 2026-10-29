import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LDAP_CONFIG_SCHEMA, TLdapConfigForm } from '@/settings/ldap/schema';
import {
  ILdapConfig,
  ILdapConfigInput,
  LDAP_SERVER_DEFAULTS,
  TLdapServerType,
} from '@/settings/ldap/types';
import {
  useLdapConfig,
  useLdapConfigSave,
  useLdapTestConnection,
} from '@/settings/ldap/hooks/useLdapConfig';

const toFormValues = (config: ILdapConfig | null): TLdapConfigForm => ({
  enabled: config?.enabled ?? false,
  serverType: config?.serverType ?? 'activeDirectory',
  url: config?.url ?? '',
  startTls: config?.startTls ?? false,
  bindDn: config?.bindDn ?? '',
  bindPassword: '',
  hasBindPassword: config?.hasBindPassword ?? false,
  baseDn: config?.baseDn ?? '',
  loginAttribute:
    config?.loginAttribute ?? LDAP_SERVER_DEFAULTS.activeDirectory.loginAttribute,
  userFilter:
    config?.userFilter ?? LDAP_SERVER_DEFAULTS.activeDirectory.userFilter,
  allowedGroupDns: config?.allowedGroupDns ?? [],
  linkEmailDomains: config?.linkEmailDomains ?? [],
  groupMappings: (config?.groupMappings ?? []).map(
    ({ groupDn, permissionGroupIds }) => ({ groupDn, permissionGroupIds }),
  ),
});

// An empty password keeps the stored one on the server
const toInput = (values: TLdapConfigForm): ILdapConfigInput => ({
  enabled: values.enabled,
  serverType: values.serverType,
  url: values.url,
  startTls: values.startTls,
  bindDn: values.bindDn,
  baseDn: values.baseDn,
  loginAttribute: values.loginAttribute,
  allowedGroupDns: values.allowedGroupDns
    .map((dn) => dn.trim())
    .filter(Boolean),
  linkEmailDomains: values.linkEmailDomains
    .map((domain) => domain.trim())
    .filter(Boolean),
  groupMappings: values.groupMappings,
  ...(values.bindPassword ? { bindPassword: values.bindPassword } : {}),
  ...(values.userFilter ? { userFilter: values.userFilter } : {}),
});

export const useLdapConfigForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const { config, loading, error } = useLdapConfig();
  const { save, loading: saving } = useLdapConfigSave();
  const {
    test,
    result: testResult,
    loading: testing,
    reset: resetTest,
  } = useLdapTestConnection();

  const form = useForm<TLdapConfigForm>({
    mode: 'onBlur',
    resolver: zodResolver(LDAP_CONFIG_SCHEMA),
    defaultValues: toFormValues(null),
  });

  useEffect(() => {
    if (!loading) {
      form.reset(toFormValues(config));
    }
  }, [config, loading, form]);

  const changeServerType = useCallback(
    (serverType: TLdapServerType) => {
      const defaults = LDAP_SERVER_DEFAULTS[serverType];

      form.setValue('serverType', serverType, { shouldDirty: true });
      form.setValue('loginAttribute', defaults.loginAttribute, {
        shouldDirty: true,
      });
      form.setValue('userFilter', defaults.userFilter, { shouldDirty: true });
    },
    [form],
  );

  const onSubmit = form.handleSubmit((values) =>
    save({
      variables: { input: toInput(values) },
      onCompleted: () => toast({ title: t('saved'), variant: 'success' }),
      onError: (e) => toast({ title: e.message, variant: 'destructive' }),
    }),
  );

  const testConnection = useCallback(
    async (identifier: string) => {
      const valid = await form.trigger([
        'url',
        'startTls',
        'bindDn',
        'baseDn',
        'loginAttribute',
      ]);

      if (!valid) return;

      test({
        variables: {
          input: toInput(form.getValues()),
          identifier: identifier.trim() || undefined,
        },
        onError: (e) => toast({ title: e.message, variant: 'destructive' }),
      });
    },
    [form, test],
  );

  return {
    form,
    loading,
    error,
    saving,
    onSubmit,
    changeServerType,
    testConnection,
    testResult,
    testing,
    resetTest,
  };
};
