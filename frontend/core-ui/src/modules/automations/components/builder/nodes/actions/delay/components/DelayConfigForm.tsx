import { Button, Form, Input, Select, cn } from 'erxes-ui';
import { TAutomationActionProps } from 'ui-modules';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { FormProvider } from 'react-hook-form';
import { useDelay } from '@/automations/components/builder/nodes/actions/delay/hooks/useDelay';
import { useTranslation } from 'react-i18next';
import { IconClockPlay, IconInfoCircle } from '@tabler/icons-react';
import { TDelayConfigForm } from '../states/delayConfigForm';

const QUICK_PRESETS: Array<{
  label: string;
  value: string;
  type: TDelayConfigForm['type'];
}> = [
  { label: '5 min', value: '5', type: 'minute' },
  { label: '15 min', value: '15', type: 'minute' },
  { label: '1 hour', value: '1', type: 'hour' },
  { label: '6 hours', value: '6', type: 'hour' },
  { label: '1 day', value: '1', type: 'day' },
  { label: '1 week', value: '7', type: 'day' },
];

const getDelayUnitLabel = (
  type: TDelayConfigForm['type'],
  value: string | undefined,
  t: (key: string, options?: { defaultValue: string }) => string,
) => {
  const count = Number(value || 0);
  const isSingular = count === 1;

  if (type === 'minute') {
    return isSingular
      ? t('minute', { defaultValue: 'minute' })
      : t('minutes', { defaultValue: 'minutes' });
  }

  if (type === 'hour') {
    return isSingular
      ? t('hour', { defaultValue: 'hour' })
      : t('hours', { defaultValue: 'hours' });
  }

  if (type === 'day') {
    return isSingular
      ? t('day', { defaultValue: 'day' })
      : t('days', { defaultValue: 'days' });
  }

  if (type === 'month') {
    return isSingular
      ? t('month', { defaultValue: 'month' })
      : t('months', { defaultValue: 'months' });
  }

  if (type === 'year') {
    return isSingular
      ? t('year', { defaultValue: 'year' })
      : t('years', { defaultValue: 'years' });
  }

  return t('days', { defaultValue: 'days' });
};

export const DelayConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps) => {
  const {
    form,
    control,
    value,
    type = 'day',
    handleValueChange,
    handleIntervalChange,
    handleSubmit,
  } = useDelay(currentAction?.config || {});
  const { t } = useTranslation('automations');
  const selectedValue = value || '1';
  const selectedUnitLabel = getDelayUnitLabel(type, selectedValue, t);
  const summary = `${selectedValue} ${selectedUnitLabel}`;

  const handlePresetClick = (preset: (typeof QUICK_PRESETS)[number]) => {
    form.setValue('value', preset.value, {
      shouldDirty: true,
      shouldTouch: true,
    });
    form.setValue('type', preset.type, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <div className="space-y-5">
          <div className="rounded-lg border bg-background px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                <IconClockPlay className="size-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  {t('delay-summary-label', {
                    defaultValue: 'Next action will run in',
                  })}
                </div>
                <div className="text-lg font-semibold leading-6 text-success">
                  {summary}
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('quick-presets', { defaultValue: 'Quick presets' })}
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_PRESETS.map((preset) => {
                const isSelected =
                  selectedValue === preset.value && type === preset.type;

                return (
                  <Button
                    key={`${preset.value}-${preset.type}`}
                    type="button"
                    variant="outline"
                    className={cn(
                      'h-8 min-w-20 justify-center bg-background px-3 text-xs font-medium',
                      isSelected && 'border-success/40 bg-success/10',
                    )}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <div className="border-t" />

          <section className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('custom-duration', { defaultValue: 'Custom duration' })}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Form.Field
                name="value"
                control={control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('wait-for')}</Form.Label>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      className="h-9"
                      onChange={(e) => handleValueChange(e, field.onChange)}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="type"
                control={control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('time-unit')}</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        handleIntervalChange(value, field.onChange)
                      }
                    >
                      <Select.Trigger id="time-unit" className="h-9">
                        <Select.Value placeholder={t('select-unit')} />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="minute">{t('minutes')}</Select.Item>
                        <Select.Item value="hour">{t('hours')}</Select.Item>
                        <Select.Item value="day">{t('days')}</Select.Item>
                        <Select.Item value="month">{t('month')}</Select.Item>
                        <Select.Item value="year">{t('year')}</Select.Item>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </section>

          <div className="flex items-start gap-2.5 rounded-lg border border-info/40 bg-info/10 px-3 py-2.5 text-xs text-info">
            <IconInfoCircle className="mt-0.5 size-3.5 shrink-0" />
            <p className="leading-5">
              {t('delay-helper-description', {
                defaultValue:
                  'The delay starts when the trigger fires. Downstream actions wait until this window completes.',
              })}
            </p>
          </div>
        </div>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
