import { IconUpload } from '@tabler/icons-react';
import { ColorPicker, Form, Upload } from 'erxes-ui';
import { TFunction } from 'i18next';
import type { Control, FieldValues, Path } from 'react-hook-form';

export function TopicColorField<T extends FieldValues>({
  control,
  name,
  t,
}: Readonly<{ control: Control<T>; name: Path<T>; t: TFunction }>) {
  return (
    <Form.Field
      control={control}
      name={name}
      rules={{ required: 'Color is required' }}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('kb-color-required')} <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <ColorPicker
              className="w-full h-8"
              value={field.value as string}
              onValueChange={(value: string) => field.onChange(value)}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

export function TopicBackgroundImageField<T extends FieldValues>({
  control,
  name,
  t,
}: Readonly<{ control: Control<T>; name: Path<T>; t: TFunction }>) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('kb-background-image')}</Form.Label>
          <Form.Control>
            <Upload.Root
              value={field.value as string}
              onChange={(fileInfo) => {
                if ('url' in fileInfo) {
                  field.onChange(fileInfo.url);
                }
              }}
            >
              <Upload.Preview />
              <div className="flex flex-col gap-2">
                <Upload.Button size="sm" variant="outline" type="button">
                  <IconUpload className="mr-2 w-4 h-4" />
                  {t('kb-upload-image')}
                </Upload.Button>
                <Upload.RemoveButton
                  size="sm"
                  variant="outline"
                  type="button"
                />
              </div>
            </Upload.Root>
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
