import { Button, Form, Separator, Spinner, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLdapConfigForm } from '@/settings/ldap/hooks/useLdapConfigForm';
import { LdapConnectionFields } from '@/settings/ldap/components/LdapConnectionFields';
import { LdapUserFields } from '@/settings/ldap/components/LdapUserFields';
import { LdapGroupMappings } from '@/settings/ldap/components/LdapGroupMappings';
import { LdapTestConnection } from '@/settings/ldap/components/LdapTestConnection';

export const LdapConfigForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const {
    form,
    loading,
    error,
    saving,
    onSubmit,
    changeServerType,
    testConnection,
    testResult,
    testing,
  } = useLdapConfigForm();
  const { control } = form;

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-10">
        <Form.Field
          control={control}
          name="enabled"
          render={({ field }) => (
            <Form.Item className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div>
                <Form.Label>{t('enabled')}</Form.Label>
                <Form.Description>{t('enabled-description')}</Form.Description>
              </div>
              <Form.Control>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </Form.Control>
            </Form.Item>
          )}
        />
        <LdapConnectionFields control={control} />
        <Separator />
        <LdapUserFields control={control} onServerTypeChange={changeServerType} />
        <Separator />
        <LdapGroupMappings control={control} />
        <LdapTestConnection
          onTest={testConnection}
          result={testResult}
          testing={testing}
        />
        <Button type="submit" className="self-end" disabled={saving}>
          {saving && <Spinner size="sm" />}
          {t('save')}
        </Button>
      </form>
    </Form>
  );
};
