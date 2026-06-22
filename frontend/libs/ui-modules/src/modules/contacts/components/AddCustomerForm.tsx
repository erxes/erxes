import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Collapsible,
  Editor,
  Form,
  InfoCard,
  Input,
  ScrollArea,
  Select,
  Spinner,
  Switch,
  Upload,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectMember } from '../../team-members/components/SelectMember';
import { useAddCustomer } from '../hooks/useAddCustomer';
import { useFieldGroups } from '../../properties/hooks/useFieldGroups';
import { useFields } from '../../properties/hooks/useFields';
import { IFieldGroup } from '../../properties/types/fieldsTypes';
import { PropertyFormField } from '../../properties/components/PropertyFormField';

const EMAIL_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Disposable', value: 'disposable' },
  { label: 'Catch all', value: 'catchall' },
  { label: 'Bad syntax', value: 'bad_syntax' },
  { label: 'Not checked', value: 'not_checked' },
];

const PHONE_VALIDATION_STATUSES = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Unverifiable', value: 'unverifiable' },
  { label: 'Mobile phone', value: 'mobile_phone' },
];

const SCHEMA = z.object({
  avatar: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().optional(),
  code: z.string().optional(),
  ownerId: z.string().optional(),
  primaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  emailValidationStatus: z.string().optional(),
  primaryPhone: z.string().optional(),
  phoneValidationStatus: z.string().optional(),
  description: z.string().optional(),
  isSubscribed: z.string().optional(),
  propertiesData: z.record(z.unknown()).optional(),
});

type FormValues = z.infer<typeof SCHEMA>;

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

  const form = useForm<FormValues>({
    resolver: zodResolver(SCHEMA),
    defaultValues: {
      avatar: '',
      firstName: '',
      lastName: '',
      code: '',
      ownerId: '',
      primaryEmail: '',
      emailValidationStatus: 'unknown',
      primaryPhone: '',
      phoneValidationStatus: 'unknown',
      description: '',
      isSubscribed: 'Yes',
      propertiesData: {},
    },
  });

  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: unknown) => {
      const current = form.getValues('propertiesData') || {};
      form.setValue('propertiesData', { ...current, [fieldId]: value });
    },
    [form],
  );

  function onSubmit({ propertiesData, ...rest }: FormValues) {
    const cleanPropertiesData =
      propertiesData && Object.keys(propertiesData).length > 0
        ? Object.fromEntries(
            Object.entries(propertiesData).filter(
              ([, v]) => v !== undefined && v !== null && v !== '',
            ),
          )
        : undefined;

    customersAdd({
      variables: { ...rest, state, propertiesData: cleanPropertiesData },
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
        onOpenChange(false);
      },
    });
  }

  const propertiesData = form.watch('propertiesData') || {};
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
          ) : (
            <GeneralTab form={form} />
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : title}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function GeneralTab({
  form,
}: Readonly<{
  form: ReturnType<typeof useForm<FormValues>>;
}>) {
  return (
    <InfoCard title="Customer Information">
      <InfoCard.Content>
        <Form.Field
          name="avatar"
          control={form.control}
          render={({ field }) => (
            <Form.Item className="mb-4">
              <Form.Control>
                <Upload.Root
                  {...field}
                  value={field.value || ''}
                  onChange={(fileInfo) => {
                    if ('url' in fileInfo) {
                      field.onChange(fileInfo.url);
                    }
                  }}
                >
                  <Upload.Preview className="rounded-full" />
                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex gap-4">
                      <Upload.Button size="sm" variant="outline" type="button">
                        Upload
                      </Upload.Button>
                      <Upload.RemoveButton
                        size="sm"
                        variant="outline"
                        type="button"
                      />
                    </div>
                    <Form.Description>
                      Upload an avatar for the customer
                    </Form.Description>
                  </div>
                </Upload.Root>
              </Form.Control>
            </Form.Item>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  First Name <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Last Name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Code</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="ownerId"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Owner</Form.Label>
                <Form.Control>
                  <div className="w-full">
                    <SelectMember.FormItem
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      placeholder="Select owner"
                    />
                  </div>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="primaryEmail"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Email</Form.Label>
                <Form.Control>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...field}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="emailValidationStatus"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Email Verification Status</Form.Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value placeholder="Choose">
                        {
                          EMAIL_VALIDATION_STATUSES.find(
                            (s) => s.value === field.value,
                          )?.label
                        }
                      </Select.Value>
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    <Select.Group>
                      {EMAIL_VALIDATION_STATUSES.map((s) => (
                        <Select.Item key={s.value} value={s.value}>
                          {s.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="primaryPhone"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Phone</Form.Label>
                <Form.Control>
                  <Input placeholder="+1 234 567 8900" {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="phoneValidationStatus"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Phone Verification Status</Form.Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value placeholder="Choose">
                        {
                          PHONE_VALIDATION_STATUSES.find(
                            (s) => s.value === field.value,
                          )?.label
                        }
                      </Select.Value>
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    <Select.Group>
                      {PHONE_VALIDATION_STATUSES.map((s) => (
                        <Select.Item key={s.value} value={s.value}>
                          {s.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item className="mt-4">
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Editor
                  initialContent={field.value}
                  onChange={field.onChange}
                  scope="customer-add-description"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="isSubscribed"
          control={form.control}
          render={({ field }) => (
            <Form.Item className="flex items-center space-x-2 space-y-0 mt-4">
              <Form.Control>
                <Switch
                  checked={field.value === 'Yes'}
                  onCheckedChange={(checked) =>
                    field.onChange(checked ? 'Yes' : 'No')
                  }
                />
              </Form.Control>
              <Form.Label variant="peer">Subscribed</Form.Label>
              <Form.Message />
            </Form.Item>
          )}
        />
      </InfoCard.Content>
    </InfoCard>
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

  if (loading) {
    return (
      <InfoCard title="Customer Properties">
        <InfoCard.Content>
          <Spinner containerClassName="py-6" />
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
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: 'core:customer',
  });

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
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <CustomerPropertyField
              key={field._id}
              field={field}
              value={propertiesData[field._id]}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}

function CustomerPropertyField({
  field,
  value,
  onFieldChange,
}: Readonly<{
  field: any;
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
