import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleOff,
  IconCircleX,
  IconMessage,
} from '@tabler/icons-react';
import {
  cn,
  DatePicker,
  Editor,
  Form,
  Input,
  Select,
  Switch,
  Upload,
} from 'erxes-ui';
import { ReactNode } from 'react';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectMember } from '../../team-members/components/SelectMember';
import { CUSTOMER_SEX_OPTIONS } from '../constants/customerSelectOptions';
import { ICustomerFormValues } from './customerFormSchema';

export type TCustomerFieldProps = {
  control: Control<ICustomerFormValues>;
  required: boolean;
};

type TOption = { label: string; value: string };

// Mirrors PHONE_VALIDATION_STATUSES in erxes-api-shared/core-modules/users/constants.
const PHONE_VALIDATION_STATUSES = [
  {
    value: 'valid',
    label: 'Valid',
    Icon: IconCircleCheck,
    className: 'text-green-500',
  },
  {
    value: 'invalid',
    label: 'Invalid',
    Icon: IconCircleX,
    className: 'text-destructive',
  },
  {
    value: 'unknown',
    label: 'Unknown',
    Icon: IconCircleDashed,
    className: 'text-muted-foreground',
  },
  {
    value: 'receives_sms',
    label: 'Can receive SMS',
    Icon: IconMessage,
    className: 'text-primary',
  },
  {
    value: 'unverifiable',
    label: 'Unverifiable',
    Icon: IconCircleOff,
    className: 'text-muted-foreground',
  },
];

const UNKNOWN_PHONE_STATUS = PHONE_VALIDATION_STATUSES[2];

const LIFECYCLE_STATES: TOption[] = [
  { label: 'Lead', value: 'lead' },
  { label: 'Customer', value: 'customer' },
];

const useFieldsT = () =>
  useTranslation('contact', { keyPrefix: 'customer.add' }).t;

const FieldLabel = ({
  children,
  required,
}: {
  children: ReactNode;
  required: boolean;
}) => (
  <Form.Label>
    {children}
    {required && <span className="text-destructive"> *</span>}
  </Form.Label>
);

type TTextName =
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'code'
  | 'primaryEmail'
  | 'primaryPhone';

const TextField = ({
  control,
  required,
  name,
  label,
}: TCustomerFieldProps & { name: TTextName; label: string }) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <FieldLabel required={required}>{label}</FieldLabel>
        <Form.Control>
          <Input className="h-8 rounded-md" {...field} />
        </Form.Control>
        <Form.Message className="text-destructive" />
      </Form.Item>
    )}
  />
);

type TSelectName = 'state';

const SelectField = ({
  control,
  required,
  name,
  label,
  options,
}: TCustomerFieldProps & {
  name: TSelectName;
  label: string;
  options: TOption[];
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <FieldLabel required={required}>{label}</FieldLabel>
        <Select onValueChange={field.onChange} value={field.value ?? ''}>
          <Form.Control>
            <Select.Trigger className="truncate w-full rounded-md justify-between text-foreground h-8">
              <Select.Value placeholder="Choose">
                {options.find((option) => option.value === field.value)?.label}
              </Select.Value>
            </Select.Trigger>
          </Form.Control>
          <Select.Content align="start">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                className="h-7 text-xs"
                value={option.value}
              >
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Form.Message className="text-destructive" />
      </Form.Item>
    )}
  />
);

export const AvatarField = ({ control, required }: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      name="avatar"
      control={control}
      render={({ field }) => (
        <Form.Item>
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
                    {t('upload', 'Upload')}
                  </Upload.Button>
                  <Upload.RemoveButton
                    size="sm"
                    variant="outline"
                    type="button"
                  />
                </div>
                <Form.Description>
                  {t('upload-description', 'Upload 1:1, 2MB max')}
                  {required && <span className="text-destructive"> *</span>}
                </Form.Description>
              </div>
            </Upload.Root>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const FirstNameField = (props: TCustomerFieldProps) => (
  <TextField
    {...props}
    name="firstName"
    label={useFieldsT()('first-name', 'First name')}
  />
);

export const MiddleNameField = (props: TCustomerFieldProps) => (
  <TextField
    {...props}
    name="middleName"
    label={useFieldsT()('middle-name', 'Middle name')}
  />
);

export const LastNameField = (props: TCustomerFieldProps) => (
  <TextField
    {...props}
    name="lastName"
    label={useFieldsT()('last-name', 'Last name')}
  />
);

export const CodeField = (props: TCustomerFieldProps) => (
  <TextField {...props} name="code" label={useFieldsT()('code', 'Code')} />
);

export const PrimaryEmailField = (props: TCustomerFieldProps) => (
  <TextField
    {...props}
    name="primaryEmail"
    label={useFieldsT()('email', 'Email')}
  />
);

const PhoneStatusSelect = ({
  control,
}: {
  control: Control<ICustomerFormValues>;
}) => (
  <Form.Field
    control={control}
    name="phoneValidationStatus"
    render={({ field }) => {
      const current =
        PHONE_VALIDATION_STATUSES.find(
          (status) => status.value === field.value,
        ) ?? UNKNOWN_PHONE_STATUS;

      return (
        <Select value={current.value} onValueChange={field.onChange}>
          <Select.Trigger
            className="absolute left-1 top-1/2 z-10 size-7 -translate-y-1/2 justify-center border-0 bg-transparent p-0 shadow-none [&>svg:last-child]:hidden"
            aria-label={current.label}
            title={current.label}
          >
            <current.Icon className={cn('size-4', current.className)} />
          </Select.Trigger>
          <Select.Content align="start">
            {PHONE_VALIDATION_STATUSES.map(
              ({ value, label, Icon, className }) => (
                <Select.Item key={value} value={value}>
                  <span className="flex items-center gap-2">
                    <Icon className={cn('size-4', className)} />
                    {label}
                  </span>
                </Select.Item>
              ),
            )}
          </Select.Content>
        </Select>
      );
    }}
  />
);

// Phone and its verification share one input; the status is picked from its icon.
export const PrimaryPhoneField = ({
  control,
  required,
}: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      control={control}
      name="primaryPhone"
      render={({ field }) => (
        <Form.Item>
          <FieldLabel required={required}>{t('phone', 'Phone')}</FieldLabel>
          <div className="relative">
            <PhoneStatusSelect control={control} />
            <Form.Control>
              <Input className="h-8 rounded-md pl-9" {...field} />
            </Form.Control>
          </div>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const OwnerIdField = ({ control }: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      control={control}
      name="ownerId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('owner', 'Owner')}</Form.Label>
          <Form.Control>
            <div className="w-full">
              <SelectMember.FormItem
                value={field.value}
                onValueChange={field.onChange}
              />
            </div>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const BirthDateField = ({ control, required }: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      control={control}
      name="birthDate"
      render={({ field }) => (
        <Form.Item>
          <FieldLabel required={required}>
            {t('birth-date', 'Birth date')}
          </FieldLabel>
          <Form.Control>
            <DatePicker
              value={field.value ?? undefined}
              defaultMonth={field.value ?? undefined}
              onChange={(date) =>
                field.onChange(date instanceof Date ? date : null)
              }
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const SexField = ({ control }: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      control={control}
      name="sex"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('pronoun', 'Pronoun')}</Form.Label>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            value={String(field.value ?? 0)}
          >
            <Form.Control>
              <Select.Trigger className="truncate w-full rounded-md justify-between text-foreground h-8">
                <Select.Value placeholder="Choose">
                  {
                    CUSTOMER_SEX_OPTIONS.find(
                      (option) => option.value === String(field.value ?? 0),
                    )?.label
                  }
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content align="start">
              {CUSTOMER_SEX_OPTIONS.map((option) => (
                <Select.Item
                  key={option.value}
                  className="h-7 text-xs"
                  value={option.value}
                >
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const StateField = (props: TCustomerFieldProps) => (
  <SelectField
    {...props}
    required={false}
    name="state"
    label={useFieldsT()('lifecycle-state', 'Lifecycle state')}
    options={LIFECYCLE_STATES}
  />
);

export const DescriptionField = ({
  control,
  required,
}: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      control={control}
      name="description"
      render={({ field }) => (
        <Form.Item>
          <FieldLabel required={required}>
            {t('description', 'Description')}
          </FieldLabel>
          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              scope="customer-description-field"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const IsSubscribedField = ({ control }: TCustomerFieldProps) => {
  const t = useFieldsT();

  return (
    <Form.Field
      name="isSubscribed"
      control={control}
      render={({ field }) => (
        <Form.Item className="flex items-center space-x-2 space-y-0">
          <Form.Control>
            <Switch
              checked={field.value === 'Yes'}
              onCheckedChange={(checked) =>
                field.onChange(checked ? 'Yes' : 'No')
              }
            />
          </Form.Control>
          <Form.Label variant="peer">
            {t('subscribed', 'Subscribed')}
          </Form.Label>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
