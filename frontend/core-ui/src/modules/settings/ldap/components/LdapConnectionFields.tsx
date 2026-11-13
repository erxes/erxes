import { Control, useWatch } from 'react-hook-form';
import { Form, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TLdapConfigForm } from '@/settings/ldap/schema';
import { LdapTextField } from '@/settings/ldap/components/LdapTextField';

export const LdapConnectionFields = ({
  control,
}: {
  control: Control<TLdapConfigForm>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });
  const hasBindPassword = useWatch({ control, name: 'hasBindPassword' });

  return (
    <div className="flex flex-col gap-4">
      <LdapTextField
        control={control}
        name="url"
        label={t('url')}
        description={t('url-description')}
        placeholder="ldaps://dc.example.local:636"
      />
      <Form.Field
        control={control}
        name="startTls"
        render={({ field }) => (
          <Form.Item className="flex items-center justify-between gap-4">
            <div>
              <Form.Label>{t('start-tls')}</Form.Label>
              <Form.Description>{t('start-tls-description')}</Form.Description>
              <Form.Message />
            </div>
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />
      <LdapTextField
        control={control}
        name="bindDn"
        label={t('bind-dn')}
        description={t('bind-dn-description')}
        placeholder="CN=erxes-service,OU=Service,DC=example,DC=local"
      />
      <LdapTextField
        control={control}
        name="bindPassword"
        type="password"
        label={t('bind-password')}
        description={
          hasBindPassword ? t('bind-password-saved') : t('bind-password-description')
        }
      />
      <LdapTextField
        control={control}
        name="baseDn"
        label={t('base-dn')}
        description={t('base-dn-description')}
        placeholder="DC=example,DC=local"
      />
    </div>
  );
};
