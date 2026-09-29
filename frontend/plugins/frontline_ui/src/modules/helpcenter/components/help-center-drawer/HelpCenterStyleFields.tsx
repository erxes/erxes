import { Form, Select, Textarea } from 'erxes-ui';
import { Control, FieldPath } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ColorDefaultAction } from '@/knowledgebase/shared/components/ColorDefaultAction';
import { HELP_CENTER_FONTS, defaultStyleColor } from '@/helpcenter/constants';
import { IHelpCenterConfigInput, TStyleName } from '@/helpcenter/types';
import {
  KbColorInput,
  KbImageUpload,
} from '@/knowledgebase/shared/components/TopicAppearanceFields';

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
            <KbColorInput
              value={field.value as string}
              onChange={field.onChange}
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
            <KbImageUpload
              value={field.value as string}
              onChange={field.onChange}
              buttonLabel={label}
            />
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
