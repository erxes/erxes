import { Control, FieldValues, Path } from 'react-hook-form';
import { Form, Input, Textarea } from 'erxes-ui';
import { SelectStructureStatus } from './SelectStructureStatus';

// Shared form fields reused by Branch/Department/Unit/Position forms to avoid
// duplicating the same title/code/description/status markup in every form.

export function TitleField<T extends FieldValues>({
  control,
}: Readonly<{
  control: Control<T>;
}>) {
  return (
    <Form.Field
      control={control}
      name={'title' as Path<T>}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Title</Form.Label>
          <Form.Control>
            <Input {...field} value={field.value ?? ''} placeholder="Title" />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

export function CodeField<T extends FieldValues>({
  control,
}: Readonly<{
  control: Control<T>;
}>) {
  return (
    <Form.Field
      control={control}
      name={'code' as Path<T>}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Code</Form.Label>
          <Form.Control>
            <Input {...field} value={field.value ?? ''} placeholder="Code" />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

export function DescriptionField<T extends FieldValues>({
  control,
}: Readonly<{
  control: Control<T>;
}>) {
  return (
    <Form.Field
      control={control}
      name={'description' as Path<T>}
      render={({ field }) => (
        <Form.Item className="col-span-2">
          <Form.Label>Description</Form.Label>
          <Form.Control>
            <Textarea
              {...field}
              value={field.value ?? ''}
              placeholder="Description"
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

// Status field that is only relevant for deleted records, so callers gate it on
// the original (default) status value.
export function DeletedStatusField<T extends FieldValues>({
  control,
}: Readonly<{
  control: Control<T>;
}>) {
  return (
    <Form.Field
      control={control}
      name={'status' as Path<T>}
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
  );
}
