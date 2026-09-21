import { Control } from 'react-hook-form';
import {
  DatePicker,
  Editor,
  Form,
  Input,
  Select,
  SexCodes,
  Switch,
  Upload,
} from 'erxes-ui';
import { CustomerFormType } from '@/contacts/customers/constants/formSchema';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { SelectMember } from 'ui-modules';
import { useTranslation } from 'react-i18next';
export const AvatarField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
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
                    {t('upload')}
                  </Upload.Button>

                  <Upload.RemoveButton
                    size="sm"
                    variant="outline"
                    type="button"
                  />
                </div>
                <Form.Description>{t('upload-description')}</Form.Description>
              </div>
            </Upload.Root>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const BirthDateField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="birthDate"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('birth-date', 'Birth date')}</Form.Label>
          <Form.Control>
            <DatePicker
              value={field.value ?? undefined}
              onChange={(date) => field.onChange(date ?? null)}
              variant="outline"
              mode="single"
              withPresent
              className="h-8 rounded-md w-full"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const SexField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="sex"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('sex', 'Gender')}</Form.Label>
          <Select
            onValueChange={(value) => field.onChange(Number(value))}
            value={field.value != null ? String(field.value) : ''}
          >
            <Form.Control>
              <Select.Trigger className="truncate w-full rounded-md justify-between text-foreground h-8">
                <Select.Value placeholder={t('sex-choose', 'Choose gender')}>
                  <span className="text-foreground font-medium text-sm">
                    {field.value != null
                      ? SexCodes[field.value as keyof typeof SexCodes]?.label
                      : ''}
                  </span>
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content align="start">
              {Object.entries(SexCodes).map(([key, { label }]) => (
                <Select.Item key={key} className="h-7 text-xs" value={key}>
                  {label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const DepartmentField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="department"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('department', 'Department')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const PositionField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="position"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('position', 'Position')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const CodeField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="code"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('code')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const DescriptionField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="description"
      render={({ field }) => (
        <Form.Item className="mb-5">
          <Form.Label>{t('description')}</Form.Label>

          <Form.Control>
            <Editor
              initialContent={field.value}
              onChange={field.onChange}
              scope={ContactsHotKeyScope.CustomerAddSheetDescriptionField}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const FirstNameField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="firstName"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('first-name')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const IsSubscribedField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      name="isSubscribed"
      control={control}
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
          <Form.Label variant="peer">{t('subscribed')}</Form.Label>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const LastNameField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="lastName"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('last-name')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const OwnerIdField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="ownerId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('owner')}</Form.Label>
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

const phoneValidationStatuses = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Unverifiable', value: 'unverifiable' },
  { label: 'Mobile phone', value: 'mobile_phone' },
];

export const PhoneValidationStatusField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="phoneValidationStatus"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('phone-verification-status')}</Form.Label>
          <Select onValueChange={field.onChange} value={field.value}>
            <Form.Control>
              <Select.Trigger className="truncate w-full rounded-md justify-between text-foreground h-8">
                <Select.Value placeholder={'Choose'}>
                  <span className="text-foreground font-medium text-sm">
                    {
                      phoneValidationStatuses.find(
                        (status) => status.value === field.value,
                      )?.label
                    }
                  </span>
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content align="start">
              {phoneValidationStatuses.map((status) => (
                <Select.Item
                  key={status.value}
                  className="h-7 text-xs"
                  value={status.value}
                >
                  {status.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const PrimaryEmailField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="primaryEmail"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('email')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const PrimaryPhoneField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer.add' });
  return (
    <Form.Field
      control={control}
      name="primaryPhone"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('phone')}</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

const lifecycleStates = [
  { label: 'Lead', value: 'lead' },
  { label: 'Customer', value: 'customer' },
];

export const StateField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="state"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Lifecycle State</Form.Label>
          <Select onValueChange={field.onChange} value={field.value ?? ''}>
            <Form.Control>
              <Select.Trigger className="truncate w-full rounded-md justify-between text-foreground h-8">
                <Select.Value placeholder="Choose state">
                  <span className="text-foreground font-medium text-sm">
                    {lifecycleStates.find((s) => s.value === field.value)
                      ?.label ?? 'Unknown'}
                  </span>
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content align="start">
              {lifecycleStates.map((state) => (
                <Select.Item
                  key={state.value}
                  className="h-7 text-xs"
                  value={state.value}
                >
                  {state.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
