import { ReactNode, useMemo, useRef } from 'react';
import {
  Control,
  FieldPathByValue,
  FieldValues,
  UseFormReturn,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Form,
  Input,
  MultipleSelector,
  Select,
  Switch,
  Textarea,
  cn,
} from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';
import {
  TOURISM_PANEL_INPUT_CLASS_NAME,
  TourismPanelFormField,
} from '@/tms/side-panel/TourismPanelForm';
import type { ITourCustomPostType } from '../tours/hooks/useTourCustomFields';
import {
  FIELD_TYPES,
  IFieldFormValues,
  IFieldGroupFormValues,
  ITourTypeFormValues,
  generateCode,
} from './customFieldUtils';

interface ICustomFieldFormProps<T> {
  defaultValues: T;
  isNew: boolean;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: T) => void;
}

const CustomFieldFormShell = <T extends FieldValues>({
  form,
  isNew,
  saving,
  onCancel,
  onSubmit,
  children,
}: Omit<ICustomFieldFormProps<T>, 'defaultValues'> & {
  form: UseFormReturn<T>;
  children: ReactNode;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={saving}
          saveLabel={isNew ? t('create') : t('save')}
        >
          {children}
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const PanelTextField = <T extends FieldValues>({
  control,
  name,
  label,
  required,
  autoFocus,
  placeholder,
  onValueChange,
}: {
  control: Control<T>;
  name: FieldPathByValue<T, string | undefined>;
  label: string;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name={name}
      label={label}
      required={required}
      rules={required ? { required: t('required') } : undefined}
      render={(field) => (
        <Input
          {...field}
          value={field.value ?? ''}
          autoFocus={autoFocus}
          placeholder={placeholder ?? label}
          className={TOURISM_PANEL_INPUT_CLASS_NAME}
          onChange={(event) => {
            field.onChange(event);
            onValueChange?.(event.target.value);
          }}
        />
      )}
    />
  );
};

const PanelSwitchField = <T extends FieldValues>({
  control,
  name,
  label,
}: {
  control: Control<T>;
  name: FieldPathByValue<T, boolean | undefined>;
  label: string;
}) => (
  <TourismPanelFormField
    control={control}
    name={name}
    label={label}
    render={(field) => (
      <div className="flex h-7 items-center">
        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
      </div>
    )}
  />
);

const PanelDescriptionField = <T extends FieldValues>({
  control,
  name,
}: {
  control: Control<T>;
  name: FieldPathByValue<T, string | undefined>;
}) => {
  const { t } = useTranslation('tourism');

  return (
    <TourismPanelFormField
      control={control}
      name={name}
      block
      label={t('description')}
      render={(field) => (
        <Textarea
          {...field}
          value={field.value ?? ''}
          rows={4}
          className={cn(TOURISM_PANEL_INPUT_CLASS_NAME, 'h-auto min-h-16')}
        />
      )}
    />
  );
};

const useGeneratedValue = (
  isNew: boolean,
  getValue: () => string | undefined,
  setValue: (value: string) => void,
  derive: (source: string) => string,
) => {
  const lastGenerated = useRef('');

  return (source: string) => {
    if (!isNew) return;

    const current = getValue() ?? '';

    if (current && current !== lastGenerated.current) return;

    const next = derive(source);
    lastGenerated.current = next;
    setValue(next);
  };
};

const toPluralLabel = (label: string) => (label ? `${label}s` : '');

export const TourTypeForm = ({
  defaultValues,
  ...props
}: ICustomFieldFormProps<ITourTypeFormValues>) => {
  const { t } = useTranslation('tourism');
  const form = useForm<ITourTypeFormValues>({ defaultValues });
  const setGeneratedPluralLabel = useGeneratedValue(
    props.isNew,
    () => form.getValues('pluralLabel'),
    (pluralLabel) => form.setValue('pluralLabel', pluralLabel),
    toPluralLabel,
  );
  const setGeneratedCode = useGeneratedValue(
    props.isNew,
    () => form.getValues('code'),
    (code) => form.setValue('code', code),
    generateCode,
  );

  return (
    <CustomFieldFormShell form={form} {...props}>
      <PanelTextField
        control={form.control}
        name="label"
        label={t('label')}
        required
        autoFocus={props.isNew}
        onValueChange={(value) => {
          setGeneratedCode(value);
          setGeneratedPluralLabel(value);
        }}
      />
      <PanelTextField
        control={form.control}
        name="pluralLabel"
        label={t('plural-label')}
        required
      />
      <PanelTextField
        control={form.control}
        name="code"
        label={t('key')}
        required
      />
      <PanelSwitchField
        control={form.control}
        name="isActive"
        label={t('active')}
      />
      <PanelDescriptionField control={form.control} name="description" />
    </CustomFieldFormShell>
  );
};

export const FieldGroupForm = ({
  defaultValues,
  typeOptions,
  ...props
}: ICustomFieldFormProps<IFieldGroupFormValues> & {
  typeOptions: ITourCustomPostType[];
}) => {
  const { t } = useTranslation('tourism');
  const form = useForm<IFieldGroupFormValues>({ defaultValues });
  const setGeneratedCode = useGeneratedValue(
    props.isNew,
    () => form.getValues('code'),
    (code) => form.setValue('code', code),
    generateCode,
  );
  const typeSelectOptions = useMemo(
    () =>
      typeOptions.map((type) => ({
        label: type.label || type.code || t('unnamed-type'),
        value: type._id,
      })),
    [typeOptions, t],
  );

  return (
    <CustomFieldFormShell form={form} {...props}>
      <PanelTextField
        control={form.control}
        name="label"
        label={t('label')}
        required
        autoFocus={props.isNew}
        onValueChange={setGeneratedCode}
      />
      <PanelTextField control={form.control} name="code" label={t('key')} />
      <TourismPanelFormField
        control={form.control}
        name="customTourTypeIds"
        block
        label={t('show-on-tour-types')}
        render={(field) => {
          const selectedValues = field.value || [];

          return (
            <MultipleSelector
              value={typeSelectOptions.filter((option) =>
                selectedValues.includes(option.value),
              )}
              options={typeSelectOptions}
              placeholder={t('select-tour-types')}
              hidePlaceholderWhenSelected
              emptyIndicator={t('no-tour-types')}
              className={cn(TOURISM_PANEL_INPUT_CLASS_NAME, 'h-auto min-h-7')}
              onChange={(options) =>
                field.onChange(options.map((option) => option.value))
              }
            />
          );
        }}
      />
    </CustomFieldFormShell>
  );
};

export const FieldForm = ({
  defaultValues,
  ...props
}: ICustomFieldFormProps<IFieldFormValues>) => {
  const { t } = useTranslation('tourism');
  const form = useForm<IFieldFormValues>({ defaultValues });
  const setGeneratedCode = useGeneratedValue(
    props.isNew,
    () => form.getValues('code'),
    (code) => form.setValue('code', code),
    generateCode,
  );
  const type = form.watch('type');
  const needsOptions = ['select', 'multiSelect', 'radio'].includes(type);

  return (
    <CustomFieldFormShell form={form} {...props}>
      <PanelTextField
        control={form.control}
        name="label"
        label={t('label')}
        required
        autoFocus={props.isNew}
        onValueChange={setGeneratedCode}
      />
      <PanelTextField control={form.control} name="code" label={t('key')} />
      <TourismPanelFormField
        control={form.control}
        name="type"
        label={t('field-type')}
        required
        rules={{ required: t('required') }}
        render={(field) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <Select.Trigger className={TOURISM_PANEL_INPUT_CLASS_NAME}>
              <Select.Value placeholder={t('select-field-type')} />
            </Select.Trigger>
            <Select.Content>
              {FIELD_TYPES.map((fieldType) => (
                <Select.Item
                  key={fieldType}
                  value={fieldType}
                  className="h-7 text-xs"
                >
                  {t(`field-type-${fieldType}`)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}
      />
      {needsOptions && (
        <PanelTextField
          control={form.control}
          name="options"
          label={t('options')}
          placeholder={t('option-placeholder')}
        />
      )}
      <PanelSwitchField
        control={form.control}
        name="isRequired"
        label={t('required')}
      />
      <PanelDescriptionField control={form.control} name="description" />
    </CustomFieldFormShell>
  );
};
