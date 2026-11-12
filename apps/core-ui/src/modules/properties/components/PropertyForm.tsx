import type { ContentType, FieldType, FieldUsage } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Form,
  IconPicker,
  InfoCard,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
  ToggleGroup,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FIELD_TYPES, getEditableTypes, hasOptions } from '../fieldTypes';
import { type IPropertyForm, type IPropertyValues, propertySchema } from '../propertySchema';
import { useFieldGroups } from '../useFields';
import { useCanManageFields } from '../usePropertyMutations';
import { AddPropertyGroup } from './PropertyGroupAdd';

type PropertyFormApi = UseFormReturn<IPropertyForm, unknown, IPropertyValues>;

const PropertyFormGroupField = ({
  form,
  contentType,
}: {
  form: PropertyFormApi;
  contentType: ContentType;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { groups } = useFieldGroups(contentType);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);

  // A group added here is picked once the list has it (the select drops unknown values).
  useEffect(() => {
    if (!pendingGroupId || !groups.some((group) => group.id === pendingGroupId)) return;
    form.setValue('groupId', pendingGroupId, { shouldDirty: true, shouldValidate: true });
    setPendingGroupId(null);
  }, [pendingGroupId, groups, form]);

  // Nothing to choose when the record type has a single group.
  useEffect(() => {
    if (form.getValues('groupId') || groups.length !== 1) return;
    form.setValue('groupId', groups[0].id, { shouldValidate: true });
  }, [groups, form]);

  return (
    <Form.Field
      control={form.control}
      name="groupId"
      render={({ field }) => (
        <Form.Item className="flex-auto">
          <Form.Label>{t('group', 'Group')}</Form.Label>
          <div className="flex gap-2">
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger className="flex-1">
                  <Select.Value placeholder={t('select-group', 'Select group')} />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                {groups.map((group) => (
                  <Select.Item key={group.id} value={group.id}>
                    {group.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <AddPropertyGroup
              contentType={contentType}
              onAdded={(group) => setPendingGroupId(group.id)}
              trigger={
                <Button type="button" variant="secondary" className="flex-none">
                  <IconPlus />
                  {t('add-group', 'Add group')}
                </Button>
              }
            />
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

// Only the formats the server enforces are offered.
const VALIDATIONS = [
  { name: 'number', label: 'Number' },
  { name: 'email', label: 'Email' },
  { name: 'date', label: 'Date' },
] as const;

const NONE = 'none';

const PropertyFormValidation = ({ form }: { form: PropertyFormApi }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');

  if (type !== 'text' && type !== 'textarea') {
    return null;
  }

  return (
    <Form.Field
      control={form.control}
      name="validation"
      render={({ field }) => (
        <Form.Item className="flex flex-col gap-3">
          <Form.Label>{t('validation', 'Validation')}</Form.Label>
          <Form.Control>
            <ToggleGroup
              type="single"
              variant="outline"
              value={field.value ?? NONE}
              onValueChange={(next) => {
                if (!next) return;
                field.onChange(next === NONE ? null : next);
              }}
              className="w-full"
            >
              <ToggleGroup.Item value={NONE} className="flex-1">
                {t('validation-none', 'None')}
              </ToggleGroup.Item>
              {VALIDATIONS.map(({ name, label }) => (
                <ToggleGroup.Item key={name} value={name} className="flex-1">
                  {t(`validation-${name}`, label)}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const PropertyFormSelectFields = ({
  form,
  heldCount,
}: {
  form: PropertyFormApi;
  /** Records holding a saved option (0 for new ones). */
  heldCount: (value: string) => number;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'options' });

  const savedValues = new Set(
    (form.formState.defaultValues?.options ?? []).map((option) => option?.value),
  );

  if (!hasOptions(type)) {
    return null;
  }

  return (
    <InfoCard title={t('select-options', 'Select options')}>
      <InfoCard.Content>
        <div className="flex flex-col gap-3">
          {fields.map((option, index) => {
            const saved = form.getValues(`options.${index}.value`);
            // Records hold this option: renaming or removing it would orphan their values.
            const held = savedValues.has(saved) ? heldCount(saved) : 0;

            return (
              <div className="flex gap-2" key={option.id}>
                <Form.Field
                  control={form.control}
                  name={`options.${index}.value`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      {index === 0 && <Form.Label>{t('label', 'Label')}</Form.Label>}
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder={t('enter-label', 'Enter label')}
                          disabled={held > 0}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                {/* Kept even when empty so the columns line up across rows. */}
                <div className="mt-auto flex h-8 w-8 shrink-0 items-center justify-center">
                  {held > 0 && (
                    <Badge
                      variant="secondary"
                      title={t('option-held-by', 'Records holding this option')}
                    >
                      {held}
                    </Badge>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  variant="secondary"
                  size="icon"
                  className="mt-auto size-8"
                  disabled={held > 0}
                  title={held > 0 ? t('option-held-by', 'Records holding this option') : undefined}
                >
                  <IconTrash />
                </Button>
              </div>
            );
          })}
          <Button type="button" onClick={() => append({ value: '' })} variant="secondary">
            <IconPlus /> {t('add-option', 'Add option')}
          </Button>
          {form.formState.errors.options?.message && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.options.message}
            </p>
          )}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};

/** Says why only similar types are offered. */
const PropertyTypeUsageHint = ({ usage, failed }: { usage?: FieldUsage; failed: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  if (failed) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'type-limited-unknown',
          'Could not check its records, so only types with the same stored value are offered.',
        )}
      </p>
    );
  }

  if (!usage || usage.records === 0) {
    return null;
  }

  return (
    <p className="text-sm text-muted-foreground">
      {t(
        'type-limited-values',
        '{{total}} records hold a value, so only types with the same stored value are offered.',
        {
          count: usage.records,
          total: usage.records,
        },
      )}
    </p>
  );
};

/** Old erxes's property form, as a full page (add and edit). */
export const PropertyForm = ({
  onSubmit,
  loading,
  defaultValues,
  isEdit,
  onCancel,
  contentType,
  fieldId,
  usage,
  usageLoading,
  usageFailed,
}: {
  onSubmit: (data: IPropertyValues) => void;
  loading: boolean;
  defaultValues: IPropertyForm;
  isEdit?: boolean;
  onCancel: () => void;
  contentType: ContentType;
  fieldId?: string;
  usage?: FieldUsage;
  usageLoading?: boolean;
  usageFailed?: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();

  const form = useForm<IPropertyForm, unknown, IPropertyValues>({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });

  // An unused field can become anything; one in use keeps its stored shape.
  const allowedTypes: FieldType[] =
    !isEdit || (!usageLoading && !usageFailed && (usage?.records ?? 0) === 0)
      ? FIELD_TYPES.map(({ value }) => value)
      : getEditableTypes(defaultValues.type);

  const optionCounts = (fieldId && usage?.options[fieldId]) || {};

  return (
    <Form {...form}>
      <form
        className="mx-auto flex w-full max-w-2xl flex-col gap-0"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex flex-col px-5 py-4 gap-5">
          <div className="flex gap-5">
            <Form.Field
              control={form.control}
              name="icon"
              render={({ field }) => (
                <Form.Item className="flex-none">
                  <Form.Label>{t('icon', 'Icon')}</Form.Label>
                  <Form.Control>
                    <IconPicker
                      onValueChange={(value) => field.onChange(value ?? '')}
                      value={field.value || undefined}
                      variant="outline"
                      size="icon"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item className="flex-auto">
                  <Form.Label>{t('name', 'Name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} autoFocus={!isEdit} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item className="flex-auto">
                <Form.Label>{t('code', 'Code')}</Form.Label>
                <Form.Control>
                  <Input {...field} value={field.value ?? ''} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item className="flex-auto">
                <Form.Label>{t('description', 'Description')}</Form.Label>
                <Form.Control>
                  <Textarea {...field} value={field.value ?? ''} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <PropertyFormGroupField form={form} contentType={contentType} />
          <Form.Field
            control={form.control}
            name="type"
            render={({ field }) => (
              <Form.Item className="flex-auto">
                <Form.Label>{t('type', 'Type')}</Form.Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);

                    if (!hasOptions(value)) form.setValue('options', []);

                    if (value !== 'text' && value !== 'textarea') form.setValue('validation', null);
                  }}
                  disabled={allowedTypes.length < 2}
                >
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-type', 'Select type')} />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    {FIELD_TYPES.filter(({ value }) => allowedTypes.includes(value)).map((type) => (
                      <Select.Item key={type.value} value={type.value}>
                        <div className="flex items-center gap-2 [&_svg]:size-4">
                          <type.icon />
                          {t(`field-type.${type.i18nKey}`, type.label)}
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                {isEdit && <PropertyTypeUsageHint usage={usage} failed={!!usageFailed} />}
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <Form.Item className="flex-auto flex flex-row items-center justify-between space-y-0">
                <Form.Label>{t('visible', 'Visible')}</Form.Label>
                <Form.Control>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <PropertyFormValidation form={form} />
          <PropertyFormSelectFields form={form} heldCount={(value) => optionCounts[value] ?? 0} />
        </div>
        <div className="flex shrink-0 justify-end gap-1 border-t p-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
          {manager && (
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Spinner containerClassName="flex-none" />
              ) : isEdit ? (
                <IconPencil />
              ) : (
                <IconPlus />
              )}
              {isEdit ? t('update-property', 'Update Property') : t('add-property', 'Add Property')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
