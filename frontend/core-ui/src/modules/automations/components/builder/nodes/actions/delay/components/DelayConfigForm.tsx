import { Button, Form, Input, Select, Switch, cn } from 'erxes-ui';
import { SelectBranches, TAutomationActionProps } from 'ui-modules';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { FormProvider } from 'react-hook-form';
import {
  branchIdOf,
  useDelayConfigForm,
} from '@/automations/components/builder/nodes/actions/delay/hooks/useDelayConfigForm';
import { useTranslation } from 'react-i18next';
import { IconClockPlay, IconInfoCircle } from '@tabler/icons-react';

export const DelayConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps) => {
  const { t } = useTranslation('automations');
  const {
    form,
    control,
    handleValueChange,
    handleIntervalChange,
    handleSubmit,
    workingTime,
    summary,
    presets,
    applyPreset,
  } = useDelayConfigForm(currentAction?.config || {});

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
              {presets.map((preset) => (
                <Button
                  key={`${preset.value}-${preset.type}`}
                  type="button"
                  variant="outline"
                  className={cn(
                    'h-8 min-w-20 justify-center bg-background px-3 text-xs font-medium',
                    preset.isSelected && 'border-success/40 bg-success/10',
                  )}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.label}
                </Button>
              ))}
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

          <section className="space-y-3">
            <Form.Field
              name="workingTime"
              control={control}
              render={({ field }) => (
                <Form.Item className="flex items-start justify-between gap-3 space-y-0">
                  <div className="space-y-1">
                    <Form.Label>
                      {t('delay-working-hours', {
                        defaultValue: 'Count only working hours',
                      })}
                    </Form.Label>
                    <Form.Description className="text-xs">
                      {t('delay-working-hours-description', {
                        defaultValue:
                          "Minutes and hours count open time only; days and longer land on the next opening; 0 waits for opening. Hours come from the record's branch, else the branch below.",
                      })}
                    </Form.Description>
                  </div>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Item>
              )}
            />
            {workingTime ? (
              <Form.Field
                name="branchId"
                control={control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('delay-working-hours-branch', {
                        defaultValue: 'Branch whose hours apply',
                      })}
                    </Form.Label>
                    <SelectBranches.FormItem
                      mode="single"
                      value={field.value ?? ''}
                      onValueChange={(value) =>
                        field.onChange(branchIdOf(value))
                      }
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            ) : null}
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
