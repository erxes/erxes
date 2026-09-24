import { IconUpload } from '@tabler/icons-react';
import { ColorPicker, Form, Select, Textarea, Upload } from 'erxes-ui';
import { Control, FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ColorDefaultAction } from '@/knowledgebase/components/ColorDefaultAction';
import { HELP_CENTER_FONTS, defaultStyleColor } from '@/helpcenter/constants';
import { IHelpCenterConfigInput, TStyleName } from '@/helpcenter/types';

export function StyleColorField({
  control,
  name,
  label,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  name: TStyleName;
  label: string;
}>) {
  const { t } = useTranslation('frontline');
  const fallback = defaultStyleColor(name);

  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center justify-between gap-2">
            <Form.Label className="font-normal text-muted-foreground">
              {label}
            </Form.Label>
            <ColorDefaultAction
              value={field.value as string}
              defaultValue={fallback}
              onReset={field.onChange}
              t={t}
            />
          </div>
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

export function StyleImageField({
  control,
  name,
  label,
  description,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  name: FieldPath<IHelpCenterConfigInput>;
  label: string;
  description: string;
}>) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Description>{description}</Form.Description>
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
                  {label}
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

export function StyleFontField({
  control,
  name,
  label,
  placeholder,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  name: TStyleName;
  label: string;
  placeholder: string;
}>) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="font-normal text-muted-foreground">
            {label}
          </Form.Label>
          <Select value={field.value as string} onValueChange={field.onChange}>
            <Form.Control>
              <Select.Trigger className="h-8">
                <Select.Value placeholder={placeholder} />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {HELP_CENTER_FONTS.map((font) => (
                <Select.Item
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

export function StyleHtmlField({
  control,
  name,
  label,
}: Readonly<{
  control: Control<IHelpCenterConfigInput>;
  name: TStyleName;
  label: string;
}>) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Textarea
              {...field}
              value={field.value as string}
              rows={6}
              spellCheck={false}
              placeholder="<div></div>"
              className="font-mono text-xs"
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
