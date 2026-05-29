import { useFormContext } from 'react-hook-form';
import { Form, Input, Skeleton } from 'erxes-ui';
import { TPositionForm } from '../../types/position';
import { SelectMember, SelectPositions } from 'ui-modules';
import { SelectStructureStatus } from '../SelectStructureStatus';

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
      <Form.Field
        control={control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Title" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="code"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Code" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
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
      {wasDeleted && (
        <Form.Field
          control={control}
          name="status"
          render={({ field }) => (
            <Form.Item className="col-span-2">
              <Form.Label>Status</Form.Label>
              <SelectStructureStatus.FormItem
                value={field.value}
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
