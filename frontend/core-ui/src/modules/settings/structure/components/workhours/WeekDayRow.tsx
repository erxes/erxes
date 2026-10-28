import { Form, Switch } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IWorkhoursForm, WorkDay } from '../../types/workhours';
import { WorkTimeField } from './WorkTimeField';

export const WeekDayRow = ({ weekDay }: { weekDay: WorkDay }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { control } = useFormContext<IWorkhoursForm>();
  const isInactive = useWatch({ control, name: `${weekDay}.inactive` });

  return (
    <div className="flex items-center gap-3 py-3" id={weekDay}>
      <Form.Field
        control={control}
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
      <span className="font-semibold">
        {t(`weekday-${weekDay.toLowerCase()}`)}
      </span>
      {isInactive ? (
        <span className="font-normal text-sm h-8 text-accent-foreground flex items-center">
          {t('not-working-day')}
        </span>
      ) : (
        <div className="flex items-center gap-8 ml-auto">
          <div className="flex items-center gap-3">
            <WorkTimeField name={`${weekDay}.startFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              {t('to')}
            </span>
            <WorkTimeField name={`${weekDay}.endTo`} />
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-sm text-accent-foreground">
              {t('lunch')}
            </span>
            <WorkTimeField name={`${weekDay}.lunchStartFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              {t('to')}
            </span>
            <WorkTimeField name={`${weekDay}.lunchEndTo`} />
          </div>
        </div>
      )}
    </div>
  );
};
