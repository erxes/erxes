import { parseTime } from '@internationalized/date';
import { DateInput, Form, TimeField } from 'erxes-ui';
import { FieldPath, useFormContext } from 'react-hook-form';
import { IWorkhoursForm } from '../../types/workhours';

type TWorkTimeFieldName = Extract<
  FieldPath<IWorkhoursForm>,
  | `${string}.startFrom`
  | `${string}.endTo`
  | `${string}.lunchStartFrom`
  | `${string}.lunchEndTo`
>;

export const WorkTimeField = ({ name }: { name: TWorkTimeFieldName }) => {
  const { control } = useFormContext<IWorkhoursForm>();

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Control>
            <TimeField
              value={field.value ? parseTime(field.value) : null}
              onChange={(next) => field.onChange(next?.toString() ?? '')}
            >
              <Form.Control>
                <DateInput />
              </Form.Control>
            </TimeField>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};
