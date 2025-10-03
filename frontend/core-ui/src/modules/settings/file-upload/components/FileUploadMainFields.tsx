import { Form, Select, MultipleSelector } from 'erxes-ui';

import { FILE_SYSTEM_TYPES } from '@/settings/file-upload/constants/serviceData';
import { UseFormReturn } from 'react-hook-form';
import { UploadConfigFormT } from '@/settings/file-upload/types';

export function FileUploadMainFields({
  form,
  fileMimeTypesOptions,
}: {
  form: UseFormReturn<UploadConfigFormT>;
  fileMimeTypesOptions: any[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Form.Item className="w-full">
        <Form.Field
          name="UPLOAD_FILE_TYPES"
          control={form.control}
          render={({ field }: { field: any }) => (
            <div className="space-y-2">
              <Form.Label>Upload File Types</Form.Label>
              <MultipleSelector
                {...field}
                options={fileMimeTypesOptions}
                placeholder="Select option"
                hideClearAllButton
                hidePlaceholderWhenSelected
                emptyIndicator={
                  <p className="text-center text-sm">No results found</p>
                }
              />
            </div>
          )}
        />
        <Form.Message />
      </Form.Item>
      <Form.Item>
        <Form.Field
          name="WIDGETS_UPLOAD_FILE_TYPES"
          control={form.control}
          render={({ field }: { field: any }) => (
            <div className="space-y-2">
              <Form.Label>Upload File Types of Widget</Form.Label>
              <MultipleSelector
                {...field}
                options={fileMimeTypesOptions}
                placeholder="Select option"
                hideClearAllButton
                hidePlaceholderWhenSelected
                emptyIndicator={
                  <p className="text-center text-sm">No results found</p>
                }
              />
            </div>
          )}
        />
        <Form.Message />
      </Form.Item>
      <Form.Field
        control={form.control}
        name="FILE_SYSTEM_PUBLIC"
        render={({ field }: { field: any }) => (
          <Form.Item>
            <Form.Label>Bucket file system type</Form.Label>
            <Form.Control>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                <Select.Trigger>
                  <Select.Value placeholder={'-'} />
                </Select.Trigger>
                <Select.Content>
                  {FILE_SYSTEM_TYPES.map((type) => (
                    <Select.Item key={type.value} value={type.value}>
                      {type.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
}
