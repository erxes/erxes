import { IconX } from '@tabler/icons-react';
import { Button, Form, ToggleGroup } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TDashboardWidgetConfig } from 'ui-modules';
import { SelectScoreCampaign } from '@/loyalties/scores/components/selects/SelectScoreCampaign';
import {
  LOYALTY_DASHBOARD_PERIODS,
  RECENT_VOUCHERS_DEFAULTS,
  recentScoreLogsConfigSchema,
  recentVouchersConfigSchema,
  SCORE_SUMMARY_DEFAULTS,
  scoreSummaryConfigSchema,
  TRecentScoreLogsConfig,
} from '../dashboardWidgetConfig';
import { useLoyaltyDashboardConfigForm } from '../hooks/useLoyaltyDashboardConfig';
import { usePeriodLabel } from '../hooks/usePeriodLabel';

type TConfigFormProps = {
  config?: TDashboardWidgetConfig | null;
  onSubmit: (config: TDashboardWidgetConfig) => void;
  onCancel: () => void;
};

const NO_CAMPAIGN: TRecentScoreLogsConfig = {};

const ConfigFormShell = ({
  onSubmit,
  onCancel,
  children,
}: {
  onSubmit: () => void;
  onCancel: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {children}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">{t('dashboard.save-widget')}</Button>
      </div>
    </form>
  );
};

// Empty means every campaign.
const CampaignPicker = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (campaignId?: string) => void;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <Form.Item>
      <Form.Label>{t('campaign')}</Form.Label>
      <div className="flex gap-2">
        <SelectScoreCampaign.FormItem
          value={value || ''}
          onValueChange={onChange}
          placeholder={t('dashboard.all-campaigns')}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t('dashboard.all-campaigns')}
            onClick={() => onChange(undefined)}
          >
            <IconX />
          </Button>
        )}
      </div>
    </Form.Item>
  );
};

const PeriodOption = ({ days }: { days: number }) => (
  <ToggleGroup.Item value={String(days)} className="px-3">
    {usePeriodLabel(days)}
  </ToggleGroup.Item>
);

export const ScoreSummaryConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TConfigFormProps) => {
  const { t } = useTranslation('loyalty');
  const { form, submit } = useLoyaltyDashboardConfigForm(
    scoreSummaryConfigSchema,
    config,
    SCORE_SUMMARY_DEFAULTS,
    onSubmit,
  );

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <CampaignPicker value={field.value} onChange={field.onChange} />
          )}
        />
        <Form.Field
          control={form.control}
          name="days"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('dashboard.period')}</Form.Label>
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-start"
                value={String(field.value)}
                onValueChange={(value) =>
                  value && field.onChange(Number(value))
                }
              >
                {LOYALTY_DASHBOARD_PERIODS.map((days) => (
                  <PeriodOption key={days} days={days} />
                ))}
              </ToggleGroup>
            </Form.Item>
          )}
        />
      </ConfigFormShell>
    </Form>
  );
};

export const RecentScoreLogsConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TConfigFormProps) => {
  const { form, submit } = useLoyaltyDashboardConfigForm(
    recentScoreLogsConfigSchema,
    config,
    NO_CAMPAIGN,
    onSubmit,
  );

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="campaignId"
          render={({ field }) => (
            <CampaignPicker value={field.value} onChange={field.onChange} />
          )}
        />
      </ConfigFormShell>
    </Form>
  );
};

export const RecentVouchersConfigForm = ({
  config,
  onSubmit,
  onCancel,
}: TConfigFormProps) => {
  const { t } = useTranslation('loyalty');
  const { form, submit } = useLoyaltyDashboardConfigForm(
    recentVouchersConfigSchema,
    config,
    RECENT_VOUCHERS_DEFAULTS,
    onSubmit,
  );

  return (
    <Form {...form}>
      <ConfigFormShell onSubmit={submit} onCancel={onCancel}>
        <Form.Field
          control={form.control}
          name="kind"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('dashboard.voucher-kind')}</Form.Label>
              <ToggleGroup
                type="single"
                variant="outline"
                className="justify-start"
                value={field.value}
                onValueChange={(value) => value && field.onChange(value)}
              >
                <ToggleGroup.Item value="issued" className="px-3">
                  {t('dashboard.voucher-kind-issued')}
                </ToggleGroup.Item>
                <ToggleGroup.Item value="redeemed" className="px-3">
                  {t('dashboard.voucher-kind-redeemed')}
                </ToggleGroup.Item>
              </ToggleGroup>
            </Form.Item>
          )}
        />
      </ConfigFormShell>
    </Form>
  );
};
