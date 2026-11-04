import { Button, Form, MultipleSelector, Select, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePermissionGroupOptions } from '@/settings/ldap/hooks/usePermissionGroupOptions';
import { useTwoFactorPolicy } from '@/settings/two-factor/hooks/useTwoFactorPolicy';
import { TWO_FACTOR_MODES } from '@/settings/two-factor/schema';

export const TwoFactorPolicyForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });
  const { form, loading, error, saving, onSubmit } = useTwoFactorPolicy();
  const { options } = usePermissionGroupOptions();
  const mode = form.watch('mode');

  if (loading) return <Spinner />;

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-6 pb-10">
        <Form.Field
          control={form.control}
          name="mode"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('policy-mode')}</Form.Label>
              <Form.Description>{t('policy-mode-description')}</Form.Description>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {TWO_FACTOR_MODES.map((value) => (
                    <Select.Item key={value} value={value}>
                      {t(`mode-${value}`)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        {mode === 'required' && (
          <Form.Field
            control={form.control}
            name="permissionGroupIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('policy-groups')}</Form.Label>
                <Form.Description>
                  {t('policy-groups-description')}
                </Form.Description>
                <Form.Control>
                  <MultipleSelector
                    options={options}
                    value={options.filter((option) =>
                      field.value.includes(option.value),
                    )}
                    onChange={(selected) =>
                      field.onChange(selected.map((option) => option.value))
                    }
                    placeholder={t('policy-groups-everyone')}
                    hidePlaceholderWhenSelected
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        )}
        <Button type="submit" className="self-end" disabled={saving}>
          {saving && <Spinner size="sm" />}
          {t('save')}
        </Button>
      </form>
    </Form>
  );
};
