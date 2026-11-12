import type { ContentType, FieldGroup, FieldType, FieldUsage } from '@erxes/core-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Form, IconPicker, Input, Select, Spinner, Switch, Textarea } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { messageOf } from '~/lib/api';
import { FIELD_TYPES, getEditableTypes } from '../fieldTypes';
import { type IPropertyForm, type IPropertyValues, propertySchema } from '../propertySchema';
import { fieldGroupsQuery, useFieldGroups } from '../useFields';
import { useCanManageFields } from '../usePropertyMutations';
import type { PropertyFormApi } from './propertyFormApi';
import { AddPropertyGroup } from './PropertyGroupAdd';
import { PropertyOptionsField } from './PropertyOptionsField';
import { PropertyTypeField, PropertyValidationField } from './PropertyTypeFields';

const PropertyFormGroupField = ({
  form,
  contentType,
}: {
  form: PropertyFormApi;
  contentType: ContentType;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const client = useQueryClient();
  const { groups, error } = useFieldGroups(contentType);

  // Nothing to choose when the record type has a single group.
  useEffect(() => {
    const [only] = groups;

    if (form.getValues('groupId') || groups.length !== 1 || !only) return;
    form.setValue('groupId', only.id, { shouldValidate: true });
  }, [groups, form]);

  // The select drops values it doesn't list, so a group added here joins the list first.
  const pick = (group: FieldGroup) => {
    client.setQueryData(
      fieldGroupsQuery(contentType).queryKey,
      (data) => data && { data: [...data.data, group] },
    );
    form.setValue('groupId', group.id, { shouldDirty: true, shouldValidate: true });
  };

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
              onAdded={pick}
              trigger={
                <Button type="button" variant="secondary" className="flex-none">
                  <IconPlus />
                  {t('add-group', 'Add group')}
                </Button>
              }
            />
          </div>
          {error && <p className="text-sm text-destructive">{messageOf(error)}</p>}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** Icon, name, code and description. */
const PropertyBasics = ({ form }: { form: PropertyFormApi }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <>
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
                <Input {...field} />
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
    </>
  );
};

const PropertyVisibleField = ({ form }: { form: PropertyFormApi }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
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
  );
};

const PropertyFormFooter = ({
  loading,
  isEdit,
  onCancel,
}: {
  loading: boolean;
  isEdit?: boolean;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const manager = useCanManageFields();

  return (
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
        onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
        noValidate
      >
        <div className="flex flex-col px-5 py-4 gap-5">
          <PropertyBasics form={form} />
          <PropertyFormGroupField form={form} contentType={contentType} />
          <PropertyTypeField
            form={form}
            allowedTypes={allowedTypes}
            hint={isEdit ? { usage, failed: !!usageFailed } : undefined}
          />
          <PropertyVisibleField form={form} />
          <PropertyValidationField form={form} />
          <PropertyOptionsField form={form} heldCount={(value) => optionCounts[value] ?? 0} />
        </div>
        <PropertyFormFooter loading={loading} isEdit={isEdit} onCancel={onCancel} />
      </form>
    </Form>
  );
};
