import { Control } from 'react-hook-form';

import { Editor, Form, Input, Select, Switch, Upload } from 'erxes-ui';

import { CustomerFormType } from '@/contacts/customers/constants/formSchema';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import { SelectMember } from 'ui-modules';

export const AvatarField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
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
                    Upload picture
                  </Upload.Button>

                  <Upload.RemoveButton
                    size="sm"
                    variant="outline"
                    type="button"
                  />
                </div>
                <Form.Description>
                  Recommended size 1:1, up to 2MB
                </Form.Description>
              </div>
            </Upload.Root>
          </Form.Control>
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
  return (
    <Form.Field
      control={control}
      name="code"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>CODE</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name="description"
      render={({ field }) => (
        <Form.Item className="mb-5">
          <Form.Label>DESCRIPTION</Form.Label>

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

const emailValidationStatuses = [
  { label: 'Valid', value: 'valid' },
  { label: 'Invalid', value: 'invalid' },
  { label: 'Accept all unverifiable', value: 'accept_all_unverifiable' },
  { label: 'Unknown', value: 'unknown' },
  { label: 'Disposable', value: 'disposable' },
  { label: 'Catch all', value: 'catchall' },
  { label: 'Bat syntax', value: 'bad_syntax' },
  { label: 'Not checked', value: 'not_checked' },
];

export const EmailValidationStatusField = ({
  control,
}: {
  control: Control<CustomerFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="emailValidationStatus"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>EMAIL VERIFICATION STATUS</Form.Label>
          <Select onValueChange={field.onChange} value={field.value}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={'Choose'}>
                  {
                    emailValidationStatuses.find(
                      (status) => status.value === field.value,
                    )?.label
                  }
                </Select.Value>
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              <Select.Group>
                {emailValidationStatuses.map((status) => (
                  <Select.Item
                    key={status.value}
                    className="text-xs h-7"
                    value={status.value}
                  >
                    {status.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select>
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
  return (
    <Form.Field
      control={control}
      name="firstName"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>FIRST NAME</Form.Label>
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
          <Form.Label variant="peer">Subscribed</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name="lastName"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>LAST NAME</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name="ownerId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>CHOOSE AN OWNER</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name="phoneValidationStatus"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>PHONE VERIFICATION STATUS</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name="primaryEmail"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>EMAIL</Form.Label>
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
  return (
    <Form.Field
      control={control}
      name="primaryPhone"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>PHONE</Form.Label>
          <Form.Control>
            <Input className="h-8 rounded-md" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
