import { Form, Switch } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { IWorkhoursForm, WorkDay } from '@/settings/structure/types/workhours';
import { WorkTimeField } from '@/settings/structure/components/workhours/WorkTimeField';

/**
 * One weekday row (active toggle + work hours + lunch hours). Shared between the
 * branch and department working-hours sheets.
 */
export const WeekDayRow = ({ weekDay }: { weekDay: WorkDay }) => {
  const form = useFormContext<IWorkhoursForm>();
  const isInactive = form.watch(`${weekDay}.inactive`) as boolean;

  return (
    <div className="flex items-center gap-3 py-3" id={weekDay}>
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
          Not working on this day
        </span>
      )) || (
        <div className="flex items-center gap-8 ml-auto">
          <div className="flex items-center gap-3">
            <WorkTimeField name={`${weekDay}.startFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              to
            </span>
            <WorkTimeField name={`${weekDay}.endTo`} />
          </div>
          <div className="flex items-center gap-3">
            <legend className="font-medium text-sm text-accent-foreground">
              Lunch
            </legend>
            <WorkTimeField name={`${weekDay}.lunchStartFrom`} />
            <span className="font-medium text-sm text-accent-foreground">
              to
            </span>
            <WorkTimeField name={`${weekDay}.lunchEndTo`} />
          </div>
        </div>
      )}
    </div>
  );
};
