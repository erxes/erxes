import { useFormContext } from 'react-hook-form';
import { Form, Skeleton } from 'erxes-ui';
import { TPositionForm } from '../../types/position';
import { SelectMember, SelectPositions } from 'ui-modules';
import {
  TitleField,
  CodeField,
  DeletedStatusField,
} from '../StructureFormFields';

export const PositionForm = ({ loading }: { loading?: boolean }) => {
  const { control, formState } = useFormContext<TPositionForm>();
  // show the status field only when the record was originally deleted, so the
  // field stays visible while the user switches it back to active
  const wasDeleted = formState.defaultValues?.status === 'deleted';

  if (loading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <TitleField control={control} />
      <CodeField control={control} />
      <Form.Field
        control={control}
        name="userIds"
        render={({ field }) => {
          return (
            <Form.Item className="col-span-2">
              <Form.Label>{'Team members'}</Form.Label>
              <Form.Control>
                <SelectMember.FormItem
                  value={field.value ?? []}
                  mode="multiple"
                  onValueChange={field.onChange}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          );
        }}
      />
      <Form.Field
        control={control}
        name="parentId"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>Parent position</Form.Label>
            <SelectPositions.FormItem
              mode="single"
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      {wasDeleted && <DeletedStatusField control={control} />}
    </div>
  );
};
