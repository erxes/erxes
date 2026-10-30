import { Control } from 'react-hook-form';
import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TLdapConfigForm } from '@/settings/ldap/schema';
import {
  LDAP_RECHECK_MINUTES,
  TLdapGroupChangePolicy,
} from '@/settings/ldap/types';

export const LdapRecheckFields = ({
  control,
}: {
  control: Control<TLdapConfigForm>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'ldap' });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold">{t('recheck-title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('recheck-description')}
        </p>
      </div>
      <Form.Field
        control={control}
        name="recheckEveryMinutes"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('recheck-every')}</Form.Label>
            <Select
              value={String(field.value)}
              onValueChange={(value) => field.onChange(Number(value))}
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {LDAP_RECHECK_MINUTES.map((minutes) => (
                  <Select.Item key={minutes} value={String(minutes)}>
                    {minutes
                      ? t('recheck-every-minutes', { count: minutes })
                      : t('recheck-off')}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="groupChangePolicy"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('group-change-policy')}</Form.Label>
            <Form.Description>
              {t('group-change-policy-description')}
            </Form.Description>
            <Select
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as TLdapGroupChangePolicy)
              }
            >
              <Form.Control>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="updatePermissions">
                  {t('group-change-update-permissions')}
                </Select.Item>
                <Select.Item value="revokeSessions">
                  {t('group-change-revoke-sessions')}
                </Select.Item>
              </Select.Content>
            </Select>
          </Form.Item>
        )}
      />
    </div>
  );
};
