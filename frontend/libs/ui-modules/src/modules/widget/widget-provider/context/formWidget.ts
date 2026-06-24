import { Icon } from '@tabler/icons-react';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';

export interface IFormWidgetForm {
  setValue: (
    field: string,
    value: unknown,
    options?: { shouldDirty?: boolean },
  ) => void;
  watch: (field: string) => unknown;
}

export interface IFormWidgetProps {
  pluginName: string;
  contentType: string;
  form: IFormWidgetForm;
}

export interface IFormWidgetModule {
  name: string;
  pluginName: string;
  contentType: string;
  icon?: Icon;
}

export const toFormWidgetForm = <T extends FieldValues>(
  form: UseFormReturn<T>,
): IFormWidgetForm => ({
  setValue: (field, value, options) =>
    form.setValue(
      field as FieldPath<T>,
      value as Parameters<UseFormReturn<T>['setValue']>[1],
      options,
    ),
  watch: (field) => form.watch(field as FieldPath<T>),
});
