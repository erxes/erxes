import { useFormContext } from 'react-hook-form';
import { Form, Skeleton } from 'erxes-ui';
import { SelectDepartments, SelectMember } from 'ui-modules';
import { TUnitForm } from '../../types/unit';
import {
  TitleField,
  CodeField,
  DescriptionField,
} from '../StructureFormFields';

export const UnitForm = ({ loading = false }: { loading?: boolean }) => {
  const { control } = useFormContext<TUnitForm>();

  if (loading) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <TitleField control={control} />
      <CodeField control={control} />
      <DescriptionField control={control} />
      <Form.Field
        control={control}
        name="supervisorId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Supervisor'}</Form.Label>
            <SelectMember.FormItem
              value={field.value ?? ''}
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
                value={field.value ?? ''}
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
              value={field.value ?? []}
              onValueChange={field.onChange}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
