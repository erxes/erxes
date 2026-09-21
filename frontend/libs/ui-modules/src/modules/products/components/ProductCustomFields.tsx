import { Button, Collapsible, InfoCard, Spinner } from 'erxes-ui';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useFieldGroups, useFields } from 'ui-modules/modules/properties';
import { PropertyFormField } from 'ui-modules/modules/properties/components/PropertyFormField';
import { IFieldGroup } from 'ui-modules/modules/properties/types/fieldsTypes';
import { IProductFormValues } from '../types';

export function AddProductFormCustomFields({
  form,
  noTopPadding,
}: {
  form: UseFormReturn<IProductFormValues>;
  noTopPadding?: boolean;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: 'core:product',
  });

  const customFieldsData = form.watch('customFieldsData') || {};

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) => {
      const currentData = form.getValues('customFieldsData') || {};
      form.setValue('customFieldsData', {
        ...currentData,
        [fieldId]: value,
      });
    },
    [form],
  );

  if (fieldGroupsLoading) {
    return (
      <InfoCard title={t('product-properties') || 'Product Properties'}>
        <InfoCard.Content>
          <Spinner containerClassName="py-6" />
        </InfoCard.Content>
      </InfoCard>
    );
  }

  if (fieldGroups.length === 0) {
    return null;
  }

  return (
    <div className={noTopPadding ? undefined : 'pt-4'}>
      <InfoCard title={t('product-properties') || 'Product Properties'}>
        <InfoCard.Content>
          <div className="flex flex-col gap-4">
            {fieldGroups.map((group) => (
              <CustomFieldsGroup
                key={group._id}
                group={group}
                customFieldsData={customFieldsData}
                onFieldChange={updateCustomFieldValue}
              />
            ))}
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
}

function CustomFieldsGroup({
  group,
  customFieldsData,
  onFieldChange,
}: {
  group: IFieldGroup;
  customFieldsData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: 'core:product',
  });

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  if (fields.length === 0) {
    return null;
  }

  return (
    <Collapsible key={group._id} className="group" defaultOpen>
      <Collapsible.Trigger asChild>
        <Button variant="secondary" className="justify-start w-full">
          <Collapsible.TriggerIcon />
          {group.name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <CustomField
              key={field._id}
              field={field}
              value={customFieldsData[field._id]}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}

function CustomField({
  field,
  value,
  onFieldChange,
}: {
  field: any;
  value: unknown;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  return (
    <PropertyFormField
      field={field}
      value={value}
      idPrefix="product_form"
      onFieldChange={onFieldChange}
    />
  );
}
