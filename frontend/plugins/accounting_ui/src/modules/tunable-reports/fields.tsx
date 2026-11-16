import { Form, Input, Select, Checkbox, Textarea } from 'erxes-ui';
import { FieldPath, UseFormReturn } from 'react-hook-form';
import { ReportValues } from '@/tunable-reports/schema';
import { useReportTranslation } from '@/tunable-reports/locales';

export type ReportForm = UseFormReturn<ReportValues>;
export type ReportPath = FieldPath<ReportValues>;
export const TextSetting = ({
  form,
  name,
  label,
  type = 'text',
  inline = false,
  inputClassName,
}: {
  form: ReportForm;
  name: ReportPath;
  label: string;
  type?: 'text' | 'number' | 'date';
  inline?: boolean;
  inputClassName?: string;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item className={inline ? 'space-y-0' : undefined}>
        <Form.Label className={inline ? 'sr-only' : undefined}>
          {label}
        </Form.Label>
        <Form.Control>
          <Input
            {...field}
            placeholder={label}
            className={[
              inline
                ? 'h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-inset'
                : '',
              inputClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            value={
              typeof field.value === 'string' || typeof field.value === 'number'
                ? field.value
                : ''
            }
            type={type}
            min={type === 'number' ? 0 : undefined}
            onChange={(event) =>
              field.onChange(
                type === 'number'
                  ? Number(event.target.value)
                  : event.target.value,
              )
            }
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);
export const TextareaSetting = ({
  form,
  name,
  label,
}: {
  form: ReportForm;
  name: 'header' | 'footer' | `sections.${number}.${'header' | 'footer'}`;
  label: string;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Textarea
            {...field}
            value={field.value || ''}
            placeholder={label}
            rows={3}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);
export const Choice = ({
  value,
  onChange,
  options,
  label,
}: {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) => (
  <Select value={value || '__inherit'} onValueChange={onChange}>
    <Select.Trigger aria-label={label}>
      <Select.Value placeholder={label} />
    </Select.Trigger>
    <Select.Content>
      {options.map((option) => (
        <Select.Item key={option.value} value={option.value}>
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);
export const ChoiceSetting = ({
  form,
  name,
  label,
  options,
  onChange,
}: {
  onChange?: (value: string) => void;
  form: ReportForm;
  name: ReportPath;
  label: string;
  options: { value: string; label: string }[];
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Choice
          label={label}
          value={typeof field.value === 'string' ? field.value : undefined}
          onChange={(value) => {
            field.onChange(value === '__inherit' ? undefined : value);
            onChange?.(value);
          }}
          options={options}
        />
        <Form.Message />
      </Form.Item>
    )}
  />
);
export const CheckSetting = ({
  form,
  name,
  label,
}: {
  form: ReportForm;
  name: ReportPath;
  label: string;
}) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item className="flex items-center gap-2 space-y-0">
        <Form.Control>
          <Checkbox
            checked={field.value === true}
            onCheckedChange={(value) => field.onChange(value === true)}
          />
        </Form.Control>
        <Form.Label>{label}</Form.Label>
        <Form.Message />
      </Form.Item>
    )}
  />
);
export const PeriodSettings = ({
  form,
  path,
}: {
  form: ReportForm;
  path: `sections.${number}.${'columns' | 'rows' | 'formulas'}.${number}`;
}) => {
  const { t } = useReportTranslation();
  return (
    <div className="grid grid-cols-2 gap-2">
      <ChoiceSetting
        form={form}
        name={`${path}.getDate`}
        label={t('period')}
        options={['__inherit', 'first', 'last', 'between'].map((value) => ({
          value,
          label: t(value === '__inherit' ? 'inherit' : value),
        }))}
      />
      <Form.Field
        control={form.control}
        name={`${path}.isPre`}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('comparison')}</Form.Label>
            <Choice
              label={t('comparison')}
              value={
                field.value === undefined
                  ? '__inherit'
                  : field.value
                  ? 'previous'
                  : 'current'
              }
              onChange={(value) =>
                field.onChange(
                  value === '__inherit' ? undefined : value === 'previous',
                )
              }
              options={['__inherit', 'current', 'previous'].map((value) => ({
                value,
                label: t(value === '__inherit' ? 'inherit' : value),
              }))}
            />
          </Form.Item>
        )}
      />
    </div>
  );
};
