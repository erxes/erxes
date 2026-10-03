import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Collapsible,
  DatePicker,
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
import { useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectMember } from '../../team-members/components/SelectMember';
import { useAddCustomer } from '../hooks/useAddCustomer';
import { useFieldGroups } from '../../properties/hooks/useFieldGroups';
import { useFields } from '../../properties/hooks/useFields';
import { IFieldGroup } from '../../properties/types/fieldsTypes';
import { PropertyFormField } from '../../properties/components/PropertyFormField';
import { GroupFieldRows } from '../../properties/components/GroupFieldRows';
import {
  ICreateFieldRules,
  useCreateFieldRules,
} from '../../properties/hooks/useCreateFieldRules';
import {
  CUSTOMER_HAS_AUTHORITY_OPTIONS,
  CUSTOMER_LEAD_STATUS_OPTIONS,
  CUSTOMER_SEX_OPTIONS,
} from '../constants/customerSelectOptions';

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
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  code: z.string().optional(),
  ownerId: z.string().optional(),
  primaryEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  emailValidationStatus: z.string().optional(),
  primaryPhone: z.string().optional(),
  phoneValidationStatus: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  leadStatus: z.string().optional(),
  hasAuthority: z.string().optional(),
  sex: z.string().optional(),
  description: z.string().optional(),
  isSubscribed: z.string().optional(),
  birthDate: z.date().optional(),
  propertiesData: z.record(z.unknown()).optional(),
});

type FormValues = z.infer<typeof SCHEMA>;

type TFieldCode = Exclude<keyof FormValues, 'propertiesData'>;

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && String(value).trim() !== '';

// Settings decide what the form asks for, so the schema follows them.
const buildSchema = ({ isShown, isRequired, groups }: ICreateFieldRules) =>
  SCHEMA.superRefine((values, ctx) => {
    for (const code of Object.keys(SCHEMA.shape) as TFieldCode[]) {
      if (isShown(code) && isRequired(code) && !hasValue(values[code])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [code],
          message: 'Required',
        });
      }
    }

    for (const codes of groups) {
      if (!codes.some((code) => hasValue(values[code as TFieldCode]))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [codes[0]],
          message: 'Fill in a name, an e-mail or a phone',
        });
      }
    }
  });

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
  const { rules, loading: rulesLoading } = useCreateFieldRules('core:customer');

  // Rules arrive after the form mounts; validate against the latest ones.
  const schemaRef = useRef(buildSchema(rules));
  schemaRef.current = useMemo(() => buildSchema(rules), [rules]);

  const form = useForm<FormValues>({
    resolver: (values, context, options) =>
      zodResolver(schemaRef.current)(values, context, options),
    defaultValues: {
      avatar: '',
      firstName: '',
      middleName: '',
      lastName: '',
      code: '',
      ownerId: '',
      primaryEmail: '',
      emailValidationStatus: 'unknown',
      primaryPhone: '',
      phoneValidationStatus: 'unknown',
      position: '',
      department: '',
      leadStatus: '',
      hasAuthority: 'No',
      sex: '0',
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

  function onSubmit({ propertiesData, sex, ...rest }: FormValues) {
    const cleanPropertiesData =
      propertiesData && Object.keys(propertiesData).length > 0
        ? Object.fromEntries(
            Object.entries(propertiesData).filter(
              ([, v]) => v !== undefined && v !== null && v !== '',
            ),
          )
        : undefined;

    customersAdd({
      variables: {
        ...rest,
        sex: Number(sex ?? 0),
        state,
        propertiesData: cleanPropertiesData,
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
          ) : rulesLoading ? (
            <Spinner containerClassName="py-12" />
          ) : (
            <GeneralTab form={form} rules={rules} />
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

const FieldLabel = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required: boolean;
}) => (
  <Form.Label>
    {children}
    {required && <span className="text-destructive"> *</span>}
  </Form.Label>
);

function TextField({
  form,
  name,
  label,
  required,
  placeholder,
  type,
}: Readonly<{
  form: ReturnType<typeof useForm<FormValues>>;
  name:
    | 'firstName'
    | 'middleName'
    | 'lastName'
    | 'code'
    | 'primaryEmail'
    | 'primaryPhone'
    | 'position'
    | 'department';
  label: string;
  required: boolean;
  placeholder?: string;
  type?: string;
}>) {
  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <FieldLabel required={required}>{label}</FieldLabel>
          <Form.Control>
            <Input type={type} placeholder={placeholder} {...field} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

function SelectField({
  form,
  name,
  label,
  required,
  options,
}: Readonly<{
  form: ReturnType<typeof useForm<FormValues>>;
  name:
    | 'emailValidationStatus'
    | 'phoneValidationStatus'
    | 'leadStatus'
    | 'hasAuthority'
    | 'sex';
  label: string;
  required: boolean;
  options: { label: string; value: string }[];
}>) {
  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <FieldLabel required={required}>{label}</FieldLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder="Choose">
                  {
                    options.find((option) => option.value === field.value)
                      ?.label
                  }
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              <Select.Group>
                {options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}

function GeneralTab({
  form,
  rules,
}: Readonly<{
  form: ReturnType<typeof useForm<FormValues>>;
  rules: ICreateFieldRules;
}>) {
  const { isShown, isRequired } = rules;

  return (
    <InfoCard title="Customer Information">
      <InfoCard.Content>
        {isShown('avatar') && (
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
                        <Upload.Button
                          size="sm"
                          variant="outline"
                          type="button"
                        >
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
                        {isRequired('avatar') && (
                          <span className="text-destructive"> *</span>
                        )}
                      </Form.Description>
                    </div>
                  </Upload.Root>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          {isShown('firstName') && (
            <TextField
              form={form}
              name="firstName"
              label="First Name"
              required={isRequired('firstName')}
            />
          )}
          {isShown('middleName') && (
            <TextField
              form={form}
              name="middleName"
              label="Middle Name"
              required={isRequired('middleName')}
            />
          )}
          {isShown('lastName') && (
            <TextField
              form={form}
              name="lastName"
              label="Last Name"
              required={isRequired('lastName')}
            />
          )}
          {isShown('code') && (
            <TextField
              form={form}
              name="code"
              label="Code"
              required={isRequired('code')}
            />
          )}

          {isShown('ownerId') && (
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
          )}

          {isShown('primaryEmail') && (
            <>
              <TextField
                form={form}
                name="primaryEmail"
                label="Email"
                type="email"
                placeholder="email@example.com"
                required={isRequired('primaryEmail')}
              />
              <SelectField
                form={form}
                name="emailValidationStatus"
                label="Email Verification Status"
                required={false}
                options={EMAIL_VALIDATION_STATUSES}
              />
            </>
          )}

          {isShown('primaryPhone') && (
            <>
              <TextField
                form={form}
                name="primaryPhone"
                label="Phone"
                placeholder="+1 234 567 8900"
                required={isRequired('primaryPhone')}
              />
              <SelectField
                form={form}
                name="phoneValidationStatus"
                label="Phone Verification Status"
                required={false}
                options={PHONE_VALIDATION_STATUSES}
              />
            </>
          )}

          {isShown('position') && (
            <TextField
              form={form}
              name="position"
              label="Position"
              required={isRequired('position')}
            />
          )}
          {isShown('department') && (
            <TextField
              form={form}
              name="department"
              label="Department"
              required={isRequired('department')}
            />
          )}
          {isShown('sex') && (
            <SelectField
              form={form}
              name="sex"
              label="Pronoun"
              required={false}
              options={CUSTOMER_SEX_OPTIONS}
            />
          )}
          {isShown('leadStatus') && (
            <SelectField
              form={form}
              name="leadStatus"
              label="Lead Status"
              required={isRequired('leadStatus')}
              options={CUSTOMER_LEAD_STATUS_OPTIONS}
            />
          )}
          {isShown('hasAuthority') && (
            <SelectField
              form={form}
              name="hasAuthority"
              label="Has Authority"
              required={false}
              options={CUSTOMER_HAS_AUTHORITY_OPTIONS}
            />
          )}

          {isShown('birthDate') && (
            <Form.Field
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <Form.Item>
                  <FieldLabel required={isRequired('birthDate')}>
                    Birth date
                  </FieldLabel>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      defaultMonth={field.value}
                      onChange={(date) =>
                        field.onChange(date instanceof Date ? date : undefined)
                      }
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          )}
        </div>

        {isShown('description') && (
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item className="mt-4">
                <FieldLabel required={isRequired('description')}>
                  Description
                </FieldLabel>
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
        )}

        {isShown('isSubscribed') && (
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
        )}
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
