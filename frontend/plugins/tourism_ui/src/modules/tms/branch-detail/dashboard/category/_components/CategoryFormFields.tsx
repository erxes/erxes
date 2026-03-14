import { Control } from 'react-hook-form';
import { Form, Input, Upload, readImage } from 'erxes-ui';
import { CategoryCreateFormType } from '../constants/formSchema';
import { SelectParentCategory } from './SelectParentCategory';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

export const CategoryNameField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input
              placeholder="e.g., Adventure Tours, Cultural Tours"
              {...field}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const CategoryParentIdField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="parentId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Parent Category</Form.Label>
          <Form.Control>
            <SelectParentCategory
              selected={field.value}
              onSelect={field.onChange}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const CategoryAttachmentField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Form.Field
      control={control}
      name="attachment"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Category Image</Form.Label>

          <Form.Control>
            <Upload.Root
              value={field.value?.url || ''}
              onChange={(fileInfo) => {
                if (typeof fileInfo === 'string') {
                  field.onChange({ ...field.value, url: fileInfo });
                } else if (fileInfo && 'url' in fileInfo) {
                  field.onChange(fileInfo);
                }
              }}
              className="relative group"
            >
              <Upload.Button
                size="sm"
                type="button"
                variant="secondary"
                className="overflow-hidden relative w-full min-h-[94px] rounded-md border border-dashed transition aspect-video bg-background hover:bg-accent"
                style={
                  field.value?.url
                    ? {
                        backgroundImage: `url(${readImage(field.value.url)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }
                    : {}
                }
              >
                {!field.value?.url && (
                  <div className="flex flex-col gap-2 justify-center items-center text-sm text-muted-foreground">
                    {isLoading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <IconUpload size={22} />
                        <span>Upload category image</span>
                      </>
                    )}
                  </div>
                )}

                {field.value?.url && (
                  <div className="flex absolute inset-0 justify-center items-center transition bg-black/0 group-hover:bg-black/30">
                    <span className="px-2 py-1 text-xs font-medium text-white rounded opacity-0 group-hover:opacity-100 bg-black/70">
                      Change image
                    </span>
                  </div>
                )}
              </Upload.Button>

              {field.value?.url && (
                <Upload.RemoveButton
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 shadow opacity-0 group-hover:opacity-100"
                >
                  <IconTrash size={14} />
                </Upload.RemoveButton>
              )}

              <div className="hidden">
                <Upload.Preview
                  onUploadStart={() => setIsLoading(true)}
                  onAllUploadsComplete={() => setIsLoading(false)}
                />
              </div>
            </Upload.Root>
          </Form.Control>

          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
