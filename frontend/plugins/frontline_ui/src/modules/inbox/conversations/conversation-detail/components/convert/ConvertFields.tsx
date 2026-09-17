import { Form, cn } from 'erxes-ui';
import { ReactNode } from 'react';
import {
  TConvertFormReturn,
  TConvertIdsFieldName,
  toArrayValue,
} from './convertForm';

export const ConvertField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <Form.Item className="flex min-w-0 flex-col gap-1.5">
    <Form.Label className="font-sans text-sm font-medium normal-case tracking-normal text-foreground">
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </Form.Label>
    {children}
    <Form.Message />
  </Form.Item>
);

export const ConvertTargetRow = ({
  columns,
  children,
}: {
  columns: 2 | 3;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'grid gap-3 rounded-lg border bg-muted/30 p-4',
      '[&_[role=combobox]]:h-9 [&_[role=combobox]]:w-full [&_[role=combobox]]:max-w-none [&_[role=combobox]]:justify-between [&_[role=combobox]]:bg-background',
      columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
    )}
  >
    {children}
  </div>
);

export type TConvertIdsSelectProps = {
  mode: 'single' | 'multiple';
  value: string[] | string;
  onValueChange: (value?: string[] | string | null) => void;
};

export const ConvertIdsField = ({
  form,
  name,
  label,
  multiple,
  children,
}: {
  form: TConvertFormReturn;
  name: TConvertIdsFieldName;
  label: string;
  multiple: boolean;
  children: (props: TConvertIdsSelectProps) => ReactNode;
}) => (
  <Form.Field
    name={name}
    control={form.control}
    render={({ field }) => (
      <ConvertField label={label}>
        {children({
          mode: multiple ? 'multiple' : 'single',
          value: multiple ? field.value : field.value[0] || '',
          onValueChange: (value) => field.onChange(toArrayValue(value)),
        })}
      </ConvertField>
    )}
  />
);
