import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Collapsible,
  Form,
  InfoCard,
  ScrollArea,
  Spinner,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddCustomer } from '../hooks/useAddCustomer';
import { useFieldGroups } from '../../properties/hooks/useFieldGroups';
import { useFields } from '../../properties/hooks/useFields';
import { IField, IFieldGroup } from '../../properties/types/fieldsTypes';
import { PropertyFormField } from '../../properties/components/PropertyFormField';
import { GroupFieldRows } from '../../properties/components/GroupFieldRows';
import { useSystemFieldRules } from '../../properties/hooks/useSystemFieldRules';
import {
  buildCustomerSchema,
  CUSTOMER_FORM_DEFAULTS,
  ICustomerFormValues,
} from '../customer-fields/customerFormSchema';
import { CustomerSystemFields } from '../customer-fields/CustomerSystemFields';

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && String(value).trim() !== '';

export function AddCustomerForm({
  onOpenChange,
  state = 'customer',
  onSuccess,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
  state?: 'lead' | 'customer';
  onSuccess?: (id: string) => void;
}>) {
  const { customersAdd, loading } = useAddCustomer();
  const [activeTab] = useQueryState<string>('tab');
  const { rules, loading: rulesLoading } = useSystemFieldRules(
    'core:customer',
    'create',
  );
  const [propertiesData, setPropertiesData] = useState<Record<string, unknown>>(
    {},
  );

  // Rules arrive after the form mounts; validate against the latest ones.
  const schemaRef = useRef(buildCustomerSchema(rules));
  schemaRef.current = useMemo(() => buildCustomerSchema(rules), [rules]);

  const form = useForm<ICustomerFormValues>({
    resolver: (values, context, options) =>
      zodResolver(schemaRef.current)(values, context, options),
    defaultValues: CUSTOMER_FORM_DEFAULTS,
  });

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) =>
      setPropertiesData((current) => ({ ...current, [fieldId]: value })),
    [],
  );

  // Lists and links are edited after creation; the state comes from the opener.
  function onSubmit(values: ICustomerFormValues) {
    const cleanPropertiesData = Object.fromEntries(
      Object.entries(propertiesData).filter(([, value]) => hasValue(value)),
    );

    customersAdd({
      variables: {
        avatar: values.avatar ?? undefined,
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        code: values.code,
        ownerId: values.ownerId,
        primaryEmail: values.primaryEmail,
        primaryPhone: values.primaryPhone,
        phoneValidationStatus: values.phoneValidationStatus,
        sex: values.sex ?? 0,
        birthDate: values.birthDate ?? undefined,
        description: values.description,
        isSubscribed: values.isSubscribed,
        state,
        propertiesData: Object.keys(cleanPropertiesData).length
          ? cleanPropertiesData
          : undefined,
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: (result) => {
        onSuccess?.(result.customersAdd._id);
        toast({
          title: 'Success',
          description:
            state === 'lead'
              ? 'Lead created successfully'
              : 'Customer created successfully',
          variant: 'success',
        });
        form.reset();
        setPropertiesData({});
        onOpenChange(false);
      },
    });
  }

  const title = state === 'lead' ? 'Create Lead' : 'Create Customer';
  const isPropertiesTab = activeTab === 'properties';

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <ScrollArea className="flex-1" viewportClassName="p-4">
          {isPropertiesTab ? (
            <CustomerPropertiesSection
              propertiesData={propertiesData}
              onFieldChange={updateCustomFieldValue}
            />
          ) : rulesLoading ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <InfoCard title="Customer Information">
              <InfoCard.Content>
                <CustomerSystemFields
                  control={form.control}
                  isShown={rules.isShown}
                  isRequired={rules.isRequired}
                />
              </InfoCard.Content>
            </InfoCard>
          )}
        </ScrollArea>

        <div className="flex shrink-0 justify-end gap-1 bg-background p-2.5 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || rulesLoading}>
            {loading ? 'Creating...' : title}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CustomerPropertiesSection({
  propertiesData,
  onFieldChange,
}: Readonly<{
  propertiesData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}>) {
  const { fieldGroups, loading } = useFieldGroups({
    contentType: 'core:customer',
  });
  const { fields, loading: fieldsLoading } = useFields({
    contentType: 'core:customer',
  });

  if (loading || fieldsLoading) {
    return (
      <InfoCard title="Customer Properties">
        <InfoCard.Content>
          <Spinner containerClassName="py-6" />
        </InfoCard.Content>
      </InfoCard>
    );
  }

  // Properties exist, but none is asked for at creation.
  if (
    fieldGroups.length > 0 &&
    !fields.some((field) => field.isVisibleToCreate)
  ) {
    return (
      <InfoCard title="Customer Properties">
        <InfoCard.Content>
          <p className="text-sm text-muted-foreground py-4 text-center">
            No properties are asked for at creation. Turn on "Visible to create"
            in Settings.
          </p>
        </InfoCard.Content>
      </InfoCard>
    );
  }

  if (fieldGroups.length === 0) {
    return (
      <InfoCard title="Customer Properties">
        <InfoCard.Content>
          <p className="text-sm text-muted-foreground py-4 text-center">
            No properties found. Create properties in Settings.
          </p>
        </InfoCard.Content>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="Customer Properties">
      <InfoCard.Content>
        <div className="flex flex-col gap-4">
          {fieldGroups.map((group) => (
            <CustomerPropertyGroup
              key={group._id}
              group={group}
              propertiesData={propertiesData}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
}

function CustomerPropertyGroup({
  group,
  propertiesData,
  onFieldChange,
}: Readonly<{
  group: IFieldGroup;
  propertiesData: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
}>) {
  const { fields: groupFields, loading } = useFields({
    groupId: group._id,
    contentType: 'core:customer',
  });
  const fields = groupFields.filter((field) => field.isVisibleToCreate);

  if (loading) return <Spinner containerClassName="py-6" />;
  if (fields.length === 0) return null;

  return (
    <Collapsible defaultOpen>
      <Collapsible.Trigger asChild>
        <Button variant="secondary" className="justify-start w-full">
          <Collapsible.TriggerIcon />
          {group.name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">
        <GroupFieldRows
          group={group}
          fields={fields}
          renderField={(field) => (
            <CustomerPropertyField
              key={field._id}
              field={field}
              value={propertiesData[field._id]}
              onFieldChange={onFieldChange}
            />
          )}
        />
      </Collapsible.Content>
    </Collapsible>
  );
}

function CustomerPropertyField({
  field,
  value,
  onFieldChange,
}: Readonly<{
  field: IField;
  value: unknown;
  onFieldChange: (fieldId: string, value: unknown) => void;
}>) {
  return (
    <PropertyFormField
      field={field}
      value={value}
      idPrefix="customer_form"
      onFieldChange={onFieldChange}
    />
  );
}
