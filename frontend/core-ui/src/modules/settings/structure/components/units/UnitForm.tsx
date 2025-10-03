import { useFormContext } from 'react-hook-form';
import { Form, Input, Skeleton, Textarea } from 'erxes-ui';
import { SelectDepartments, SelectMember } from 'ui-modules';
import { TUnitForm } from '../../types/unit';

export const UnitForm = ({ loading = false }: { loading?: boolean }) => {
  const { control } = useFormContext<TUnitForm>();

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
        name="description"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Textarea {...field} placeholder="Description" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="supervisorId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Supervisor'}</Form.Label>
            <SelectMember.FormItem
              value={field.value}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="departmentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Department'}</Form.Label>
            <Form.Control>
              <SelectDepartments.FormItem
                mode={'single'}
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="userIds"
        render={({ field }) => (
          <Form.Item className="col-span-2">
            <Form.Label>{'Team members'}</Form.Label>
            <SelectMember.FormItem
              mode="multiple"
              value={field.value}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
