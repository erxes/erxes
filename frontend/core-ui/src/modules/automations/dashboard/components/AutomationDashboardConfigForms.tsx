import {
  AUTOMATION_DASHBOARD_LIST_MAX,
  AUTOMATION_DASHBOARD_STATS_DAYS,
  automationListConfigSchema,
  automationRunsConfigSchema,
  automationStatsConfigSchema,
} from '@/automations/dashboard/automationDashboardConfig';
import { AutomationDashboardPicker } from '@/automations/dashboard/components/AutomationDashboardPicker';
import { useAutomationDashboardConfigForm } from '@/automations/dashboard/hooks/useAutomationDashboardConfigForm';
import { TDashboardWidgetConfigFormProps } from '@/home/dashboard/types/dashboardTypes';
import { Button, Form, ToggleGroup } from 'erxes-ui';
import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const ConfigFormFooter = ({ onCancel }: { onCancel: () => void }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onCancel}>
        {t('cancel')}
      </Button>
      <Button type="submit">{t('dashboard-save-widget')}</Button>
    </div>
  );
};

// Schema messages are translation keys, so they are translated here.
const ConfigFieldError = ({ error }: { error?: FieldError }) => {
  const { t } = useTranslation('automations');

  return error?.message ? (
    <p className="text-sm text-destructive">{t(error.message)}</p>
  ) : null;
};

const ConfigFormShell = ({
  onSubmit,
  onCancel,
  children,
}: {
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode;
}) => (
  <form
    className="flex flex-col gap-4"
    onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}
  >
    {children}
    <ConfigFormFooter onCancel={onCancel} />
  </form>
);

export const AutomationListConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TDashboardWidgetConfigFormProps) => {
  const { t } = useTranslation('automations');
  const { form, submit } = useAutomationDashboardConfigForm(
    automationListConfigSchema,
    config,
    { automationIds: [] },
    onSubmit,
  );

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="automationIds"
          render={({ field, fieldState }) => (
            <Form.Item>
              <Form.Label>
                {t('dashboard-automations-field', {
                  max: AUTOMATION_DASHBOARD_LIST_MAX,
                })}
              </Form.Label>
              <AutomationDashboardPicker
                value={field.value}
                onChange={field.onChange}
                max={AUTOMATION_DASHBOARD_LIST_MAX}
              />
              <ConfigFieldError error={fieldState.error} />
            </Form.Item>
          )}
        />
      </ConfigFormShell>
    </Form>
  );
};

export const AutomationRunsConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TDashboardWidgetConfigFormProps) => {
  const { t } = useTranslation('automations');
  const { form, submit } = useAutomationDashboardConfigForm(
    automationRunsConfigSchema,
    config,
    { automationId: '' },
    onSubmit,
  );

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="automationId"
          render={({ field, fieldState }) => (
            <Form.Item>
              <Form.Label>{t('dashboard-automation-field')}</Form.Label>
              <AutomationDashboardPicker
                value={field.value ? [field.value] : []}
                onChange={(ids) => field.onChange(ids[0] || '')}
                max={1}
              />
              <ConfigFieldError error={fieldState.error} />
            </Form.Item>
          )}
        />
      </ConfigFormShell>
    </Form>
  );
};

const AutomationStatsConfigFormBase = ({
  config,
  onSubmit,
  onCancel,
  withDays,
}: TDashboardWidgetConfigFormProps & { withDays: boolean }) => {
  const { t } = useTranslation('automations');
  const { form, submit } = useAutomationDashboardConfigForm(
    automationStatsConfigSchema,
    config,
    { automationId: '', days: 30 },
    onSubmit,
  );

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="automationId"
          render={({ field, fieldState }) => (
            <Form.Item>
              <Form.Label>{t('dashboard-automation-field')}</Form.Label>
              <AutomationDashboardPicker
                value={field.value ? [field.value] : []}
                onChange={(ids) => field.onChange(ids[0] || '')}
                max={1}
              />
              <ConfigFieldError error={fieldState.error} />
            </Form.Item>
          )}
        />
        {withDays && (
          <Form.Field
            control={form.control}
            name="days"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('dashboard-period-field')}</Form.Label>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  className="justify-start"
                  value={String(field.value)}
                  onValueChange={(value) =>
                    value && field.onChange(Number(value))
                  }
                >
                  {AUTOMATION_DASHBOARD_STATS_DAYS.map((days) => (
                    <ToggleGroup.Item
                      key={days}
                      value={String(days)}
                      className="px-3"
                    >
                      {t('dashboard-last-days', { count: days })}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup>
              </Form.Item>
            )}
          />
        )}
      </ConfigFormShell>
    </Form>
  );
};

export const AutomationStatsConfigForm = (
  props: TDashboardWidgetConfigFormProps,
) => <AutomationStatsConfigFormBase {...props} withDays />;

// Activity has its own 24h / 7d / 30d switch, so no period to store.
export const AutomationActivityConfigForm = (
  props: TDashboardWidgetConfigFormProps,
) => <AutomationStatsConfigFormBase {...props} withDays={false} />;
