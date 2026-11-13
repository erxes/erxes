import { useTranslation } from 'react-i18next';
import { Form, Switch } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { IWorkhoursForm, WorkDay } from '@/settings/structure/types/workhours';
import { WorkTimeField } from '@/settings/structure/components/workhours/WorkTimeField';

/**
 * One weekday row (active toggle + work hours + lunch hours). Shared between the
 * branch and department working-hours sheets.
 */
export const WeekDayRow = ({ weekDay }: { weekDay: WorkDay }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const form = useFormContext<IWorkhoursForm>();
  const isInactive = form.watch(`${weekDay}.inactive`) as boolean;

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 py-4" id={weekDay}>
      <Form.Field
        control={form.control}
        name={`${weekDay}.inactive`}
        render={({ field }) => (
          <Form.Item>
            <Form.Control>
              <Switch
                checked={!field.value}
                onCheckedChange={(checked) => field.onChange(!checked)}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
      <span className="font-semibold">{weekDay}</span>
      {(isInactive && (
        <span className="font-normal text-sm h-8 text-accent-foreground flex items-center">
          {t('not-working-day')}
        </span>
      )) || (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 @min-[640px]/record-panel:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t('working-hours-label')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <WorkTimeField name={`${weekDay}.startFrom`} />
              <span className="text-sm text-accent-foreground">{t('to')}</span>
              <WorkTimeField name={`${weekDay}.endTo`} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {t('lunch')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <WorkTimeField name={`${weekDay}.lunchStartFrom`} />
              <span className="text-sm text-accent-foreground">{t('to')}</span>
              <WorkTimeField name={`${weekDay}.lunchEndTo`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
