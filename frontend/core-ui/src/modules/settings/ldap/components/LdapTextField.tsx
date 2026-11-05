import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { TLdapConfigForm } from '@/settings/ldap/schema';

type TLdapTextFieldName =
  | 'url'
  | 'bindDn'
  | 'bindPassword'
  | 'baseDn'
  | 'loginAttribute'
  | 'userFilter';

export const LdapTextField = ({
  control,
  name,
  label,
  description,
  placeholder,
  type = 'text',
}: {
  control: Control<TLdapConfigForm>;
  name: TLdapTextFieldName;
  label: string;
  description?: string;
  placeholder?: string;
  type?: 'text' | 'password';
}) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        {description && <Form.Description>{description}</Form.Description>}
        <Form.Control>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            autoComplete={type === 'password' ? 'new-password' : 'off'}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);
