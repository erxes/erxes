import { useState } from 'react';
import { Button, Input, Label } from 'erxes-ui';
import { IGolomtBankConfigsItem } from '../../types/IConfigs';

type Props = {
  config?: IGolomtBankConfigsItem;
  onSubmit: (values: any, object?: IGolomtBankConfigsItem) => void;
  closeModal: () => void;
  loading?: boolean;
};

const ConfigForm = ({
  config,
  onSubmit,
  closeModal,
  loading = false,
}: Props) => {
  const [values, setValues] = useState({
    registerId: config?.registerId ?? '',
    accountId: config?.accountId ?? '',
    name: config?.name ?? '',
    organizationName: config?.organizationName ?? '',
    ivKey: config?.ivKey ?? '',
    clientId: config?.clientId ?? '',
    sessionKey: config?.sessionKey ?? '',
    golomtCode: config?.golomtCode ?? '',
    apiUrl: config?.apiUrl ?? '',
    configPassword: config?.configPassword ?? '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit(
      {
        ...values,
        ...(config?._id ? { _id: config._id } : {}),
      },
      config,
    );
  };

  const renderField = (
    label: string,
    name: keyof typeof values,
    type: string = 'text',
  ) => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={values[name]}
        onChange={onChange}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderField('Register ID', 'registerId')}
      {renderField('Account ID', 'accountId')}
      {renderField('Name', 'name')}
      {renderField('Organization Name', 'organizationName')}
      {renderField('IV Key', 'ivKey')}
      {renderField('Client ID', 'clientId')}
      {renderField('Session Key', 'sessionKey')}
      {renderField('Golomt Code', 'golomtCode')}
      {renderField('API URL', 'apiUrl')}
      {renderField('Config Password', 'configPassword', 'password')}

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={closeModal}
          disabled={loading}
        >
          Close
        </Button>

        <Button type="submit" disabled={loading}>
          {config ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default ConfigForm;
