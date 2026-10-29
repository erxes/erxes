import { Control } from 'react-hook-form';
import { Form, Select, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TLdapConfigForm } from '@/settings/ldap/schema';
import { TLdapServerType } from '@/settings/ldap/types';
import { LdapTextField } from '@/settings/ldap/components/LdapTextField';

export const LdapUserFields = ({
  control,
  onServerTypeChange,
}: {
  control: Control<TLdapConfigForm>;
  onServerTypeChange: (serverType: TLdapServerType) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });

  return (
    <div className="flex flex-col gap-4">
      <Form.Field
        control={control}
        name="serverType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('server-type')}</Form.Label>
            <Form.Description>{t('server-type-description')}</Form.Description>
            <Select
              value={field.value}
              onValueChange={(value) =>
                onServerTypeChange(value as TLdapServerType)
              }
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="activeDirectory">Active Directory</Select.Item>
                <Select.Item value="openLdap">OpenLDAP</Select.Item>
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
      <LdapTextField
        control={control}
        name="loginAttribute"
        label={t('login-attribute')}
        description={t('login-attribute-description')}
      />
      <LdapTextField
        control={control}
        name="userFilter"
        label={t('user-filter')}
        description={t('user-filter-description')}
      />
      <Form.Field
        control={control}
        name="allowedGroupDns"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('allowed-groups')}</Form.Label>
            <Form.Description>{t('allowed-groups-description')}</Form.Description>
            <Form.Control>
              {/* One DN per line: DNs contain commas, so tag inputs split them */}
              <Textarea
                rows={3}
                value={field.value.join('\n')}
                onChange={(e) => field.onChange(e.target.value.split('\n'))}
                onBlur={field.onBlur}
                placeholder="CN=erxes-users,OU=Groups,DC=example,DC=local"
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="linkEmailDomains"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('link-email-domains')}</Form.Label>
            <Form.Description>
              {t('link-email-domains-description')}
            </Form.Description>
            <Form.Control>
              <Textarea
                rows={2}
                value={field.value.join('\n')}
                onChange={(e) => field.onChange(e.target.value.split('\n'))}
                onBlur={field.onBlur}
                placeholder="example.com"
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
