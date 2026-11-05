import {
  Form,
  Input,
  MultipleSelector,
  Select,
  Switch,
  Textarea,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
} from 'ui-modules';
import { TourismPanelFormField } from '@/tms/side-panel/TourismPanelForm';
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

const PanelSwitch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex h-7 items-center">
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export const TourTypeForm = ({
  defaultValues,
  isNew,
  saving,
  onCancel,
  onSubmit,
}: ICustomFieldFormProps<ITourTypeFormValues>) => {
  const { t } = useTranslation('tourism');
  const form = useForm<ITourTypeFormValues>({ defaultValues });

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
          <Form.Field
            control={form.control}
            name="label"
            rules={{ required: t('required') }}
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('label')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  autoFocus={isNew}
                  placeholder={t('label')}
                  className={PANEL_INPUT_CLASS_NAME}
                  onChange={(event) => {
                    field.onChange(event);
                    const value = event.target.value;
                    if (isNew && !form.getValues('code')) {
                      form.setValue('code', generateCode(value));
                    }
                    if (isNew && !form.getValues('pluralLabel')) {
                      form.setValue('pluralLabel', `${value}s`);
                    }
                  }}
                />
              </PanelFormRow>
            )}
          />
          <Form.Field
            control={form.control}
            name="pluralLabel"
            rules={{ required: t('required') }}
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('plural-label')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  placeholder={t('plural-label')}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />
          <Form.Field
            control={form.control}
            name="code"
            rules={{ required: t('required') }}
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('key')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  placeholder={t('key')}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              </PanelFormRow>
            )}
          />
          <TourismPanelFormField
            control={form.control}
            name="isActive"
            label={t('active')}
            render={(field) => (
              <PanelSwitch
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <TourismPanelFormField
            control={form.control}
            name="description"
            block
            label={t('description')}
            render={(field) => (
              <Textarea
                {...field}
                value={field.value || ''}
                rows={4}
                className="text-xs"
              />
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

export const FieldGroupForm = ({
  defaultValues,
  isNew,
  saving,
  onCancel,
  onSubmit,
  typeOptions,
}: ICustomFieldFormProps<IFieldGroupFormValues> & {
  typeOptions: ITourCustomPostType[];
}) => {
  const { t } = useTranslation('tourism');
  const form = useForm<IFieldGroupFormValues>({ defaultValues });
  const typeSelectOptions = useMemo(
    () =>
      typeOptions.map((type) => ({
        label: type.label || type.code || t('unnamed-type'),
        value: type._id,
      })),
    [typeOptions, t],
  );

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
          <Form.Field
            control={form.control}
            name="label"
            rules={{ required: t('required') }}
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('label')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  autoFocus={isNew}
                  placeholder={t('label')}
                  className={PANEL_INPUT_CLASS_NAME}
                  onChange={(event) => {
                    field.onChange(event);
                    if (isNew && !form.getValues('code')) {
                      form.setValue('code', generateCode(event.target.value));
                    }
                  }}
                />
              </PanelFormRow>
            )}
          />
          <TourismPanelFormField
            control={form.control}
            name="code"
            label={t('key')}
            render={(field) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder={t('key')}
                className={PANEL_INPUT_CLASS_NAME}
              />
            )}
          />
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
                  onChange={(options) =>
                    field.onChange(options.map((option) => option.value))
                  }
                />
              );
            }}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

export const FieldForm = ({
  defaultValues,
  isNew,
  saving,
  onCancel,
  onSubmit,
}: ICustomFieldFormProps<IFieldFormValues>) => {
  const { t } = useTranslation('tourism');
  const form = useForm<IFieldFormValues>({ defaultValues });
  const type = form.watch('type');
  const needsOptions = ['select', 'multiSelect', 'radio'].includes(type);

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
          <Form.Field
            control={form.control}
            name="label"
            rules={{ required: t('required') }}
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('label')}
                required
                error={fieldState.error?.message}
              >
                <Input
                  {...field}
                  autoFocus={isNew}
                  placeholder={t('label')}
                  className={PANEL_INPUT_CLASS_NAME}
                  onChange={(event) => {
                    field.onChange(event);
                    if (isNew && !form.getValues('code')) {
                      form.setValue('code', generateCode(event.target.value));
                    }
                  }}
                />
              </PanelFormRow>
            )}
          />
          <TourismPanelFormField
            control={form.control}
            name="code"
            label={t('key')}
            render={(field) => (
              <Input
                {...field}
                value={field.value || ''}
                placeholder={t('key')}
                className={PANEL_INPUT_CLASS_NAME}
              />
            )}
          />
          <Form.Field
            control={form.control}
            name="type"
            rules={{ required: t('required') }}
            render={({ field, fieldState }) => (
              <PanelFormRow
                label={t('field-type')}
                required
                error={fieldState.error?.message}
              >
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger className={PANEL_INPUT_CLASS_NAME}>
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
              </PanelFormRow>
            )}
          />
          {needsOptions && (
            <TourismPanelFormField
              control={form.control}
              name="options"
              label={t('options')}
              render={(field) => (
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder={t('option-placeholder')}
                  className={PANEL_INPUT_CLASS_NAME}
                />
              )}
            />
          )}
          <TourismPanelFormField
            control={form.control}
            name="isRequired"
            label={t('required')}
            render={(field) => (
              <PanelSwitch
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <TourismPanelFormField
            control={form.control}
            name="description"
            block
            label={t('description')}
            render={(field) => (
              <Textarea
                {...field}
                value={field.value || ''}
                rows={4}
                className="text-xs"
              />
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};
