import { useFormContext } from 'react-hook-form';
import { Form } from 'erxes-ui';
import { SelectDepartments, SelectMember } from 'ui-modules';
import { TDepartmentForm } from '../../types/department';
import {
  TitleField,
  CodeField,
  DescriptionField,
  DeletedStatusField,
} from '../StructureFormFields';

export const DepartmentForm = () => {
  const { control, formState } = useFormContext<TDepartmentForm>();
  // show the status field only when the record was originally deleted, so the
  // field stays visible while the user switches it back to active
  const wasDeleted = formState.defaultValues?.status === 'deleted';

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
        name="parentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{'Parent'}</Form.Label>
            <Form.Control>
              <SelectDepartments.FormItem
                mode="single"
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
      {wasDeleted && <DeletedStatusField control={control} />}
    </div>
  );
};
