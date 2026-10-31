import {
  Button,
  DatePicker,
  Form,
  MultipleSelector,
  Select,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePermissionGroupOptions } from '@/settings/ldap/hooks/usePermissionGroupOptions';
import { useSupportAccessPolicy } from '@/settings/support-access/hooks/useSupportAccessPolicy';
import { SUPPORT_ACCESS_MODES } from '@/settings/support-access/schema';

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today;
};

export const SupportAccessPolicyForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'support-access' });
  const { form, mode, available, allowEndedOn, loading, error, saving, onSubmit } =
    useSupportAccessPolicy();
  const { options } = usePermissionGroupOptions();

  if (loading) return <Spinner />;

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-semibold">{t('policy-title')}</h3>
      {!available && (
        <p className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          {t('unavailable')}
        </p>
      )}
      {allowEndedOn && (
        <p className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          {t('allow-ended', { date: allowEndedOn })}
        </p>
      )}
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <Form.Field
            control={form.control}
            name="mode"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('mode')}</Form.Label>
                <Form.Description>
                  {t(`mode-${field.value}-description`)}
                </Form.Description>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {SUPPORT_ACCESS_MODES.map((value) => (
                      <Select.Item key={value} value={value}>
                        {t(`mode-${value}`)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Item>
            )}
          />
          {mode === 'allow' && (
            <>
              <Form.Field
                control={form.control}
                name="allowUntil"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('allow-until')}</Form.Label>
                    <Form.Description>
                      {t('allow-until-description')}
                    </Form.Description>
                    <Form.Control>
                      <DatePicker
                        value={field.value ?? undefined}
                        onChange={(date) =>
                          field.onChange(date instanceof Date ? date : null)
                        }
                        minDate={startOfToday()}
                        placeholder={t('allow-until-empty')}
                        clearable
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="permissionGroupIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('groups')}</Form.Label>
                    <Form.Description>{t('groups-description')}</Form.Description>
                    <Form.Control>
                      <MultipleSelector
                        options={options}
                        value={options.filter((option) =>
                          field.value.includes(option.value),
                        )}
                        onChange={(selected) =>
                          field.onChange(selected.map((option) => option.value))
                        }
                        placeholder={t('groups-all-admin')}
                        hidePlaceholderWhenSelected
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </>
          )}
          <Button type="submit" className="self-end" disabled={saving}>
            {saving && <Spinner size="sm" />}
            {t('save')}
          </Button>
        </form>
      </Form>
    </section>
  );
};
