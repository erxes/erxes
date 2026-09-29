import { IconUpload } from '@tabler/icons-react';
import { ColorPicker, Form, Upload } from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';

export function KbColorInput({
  value,
  onChange,
}: Readonly<{ value: string; onChange: (value: string) => void }>) {
  return (
    <ColorPicker
      className="w-full h-8"
      value={value}
      onValueChange={(next: string) => onChange(next)}
    />
  );
}

export function KbImageUpload({
  value,
  onChange,
  buttonLabel,
}: Readonly<{
  value: string;
  onChange: (url: string) => void;
  buttonLabel: string;
}>) {
  return (
    <Upload.Root
      value={value}
      onChange={(fileInfo) => {
        if ('url' in fileInfo) {
          onChange(fileInfo.url);
        }
      }}
    >
      <Upload.Preview />
      <div className="flex flex-col gap-2">
        <Upload.Button size="sm" variant="outline" type="button">
          <IconUpload className="mr-2 w-4 h-4" />
          {buttonLabel}
        </Upload.Button>
        <Upload.RemoveButton size="sm" variant="outline" type="button" />
      </div>
    </Upload.Root>
  );
}

type TTopicFieldProps<T extends FieldValues> = Readonly<{
  control: Control<T>;
  name: Path<T>;
  t: TFunction;
}>;

function KbControlField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  renderControl,
}: Readonly<{
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: string;
  renderControl: (
    value: string,
    onChange: (value: string) => void,
  ) => ReactNode;
}>) {
  return (
    <Form.Field
      control={control}
      name={name}
      rules={required ? { required } : undefined}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            {renderControl(field.value as string, field.onChange)}
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

export const TopicColorField = <T extends FieldValues>({
  control,
  name,
  t,
}: TTopicFieldProps<T>) => (
  <KbControlField
    control={control}
    name={name}
    label={t('kb-color-required')}
    required="Color is required"
    renderControl={(value, onChange) => (
      <KbColorInput value={value} onChange={onChange} />
    )}
  />
);

export const TopicBackgroundImageField = <T extends FieldValues>({
  control,
  name,
  t,
}: TTopicFieldProps<T>) => (
  <KbControlField
    control={control}
    name={name}
    label={t('kb-background-image')}
    renderControl={(value, onChange) => (
      <KbImageUpload
        value={value}
        onChange={onChange}
        buttonLabel={t('kb-upload-image')}
      />
    )}
  />
);
