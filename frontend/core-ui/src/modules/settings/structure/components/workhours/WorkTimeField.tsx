import { DateInput, Form, TimeField } from 'erxes-ui';
import { parseTime } from '@internationalized/date';
import { FieldPath, useFormContext } from 'react-hook-form';
import { IWorkhoursForm } from '@/settings/structure/types/workhours';

/**
 * A single time picker bound to a `HH:mm` string field of the workhours form.
 * Shared by the weekday rows and the custom-holiday working-hours inputs.
 */
export const WorkTimeField = ({
  name,
}: {
  name: FieldPath<IWorkhoursForm>;
}) => {
  const form = useFormContext<IWorkhoursForm>();

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | undefined;
        return (
          <Form.Item>
            <Form.Control>
              <TimeField
                value={value ? parseTime(value) : null}
                onChange={(next) => field.onChange(next?.toString())}
              >
                <Form.Control>
                  <DateInput />
                </Form.Control>
              </TimeField>
            </Form.Control>
          </Form.Item>
        );
      }}
    />
  );
};
