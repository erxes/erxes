import {
  APPROVAL_DASHBOARD_SCOPES,
  APPROVAL_REQUESTS_DEFAULT_CONFIG,
  approvalRequestsConfigSchema,
  TApprovalRequestsConfig,
} from '@/approval/dashboard/approvalDashboardConfig';
import { TDashboardWidgetConfigFormProps } from '@/home/dashboard/types/dashboardTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, ToggleGroup } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const ApprovalRequestsConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TDashboardWidgetConfigFormProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'home.widgets' });
  const parsed = approvalRequestsConfigSchema.safeParse(config);

  const form = useForm<TApprovalRequestsConfig>({
    resolver: zodResolver(approvalRequestsConfigSchema),
    defaultValues: parsed.success
      ? parsed.data
      : APPROVAL_REQUESTS_DEFAULT_CONFIG,
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => onSubmit(values))}
      >
        <Form.Field
          control={form.control}
          name="scope"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('approvals-scope')}</Form.Label>
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-start"
                value={field.value}
                onValueChange={(value) => value && field.onChange(value)}
              >
                {APPROVAL_DASHBOARD_SCOPES.map((scope) => (
                  <ToggleGroup.Item key={scope} value={scope} className="px-3">
                    {t(`approvals-scope-${scope}`)}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </Form.Item>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('approvals-cancel')}
          </Button>
          <Button type="submit">{t('approvals-save')}</Button>
        </div>
      </form>
    </Form>
  );
};
