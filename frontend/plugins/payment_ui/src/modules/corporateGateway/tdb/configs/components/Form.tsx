import { useState } from 'react';
import { Button, Input, Label } from 'erxes-ui';
import { ITdbConfig } from '../types';

type Props = {
  config?: ITdbConfig;
  onSubmit: (values: any) => void;
  closeModal: () => void;
  loading?: boolean;
};

const DEFAULT_API_URL = 'https://acsmc.tdbmlabs.mn:8000/order';

const ConfigForm = ({
  config,
  onSubmit,
  closeModal,
  loading = false,
}: Props) => {
  const [values, setValues] = useState({
    name: config?.name ?? '',
    description: config?.description ?? '',
    apiUrl: config?.apiUrl ?? DEFAULT_API_URL,
    username: config?.username ?? '',
    password: '',
    testMode: config?.testMode ?? true,
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: name === 'testMode' ? value === 'true' : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...values,
      ...(config?._id ? { _id: config._id } : {}),
    });

    closeModal();
  };

  const renderField = (
    label: string,
    name: keyof typeof values,
    type = 'text',
  ) => (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        name={name}
        type={type}
        value={String(values[name] ?? '')}
        onChange={onChange}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderField('Name', 'name')}
      {renderField('Description', 'description')}
      {renderField('API URL', 'apiUrl')}
      {renderField('Username', 'username')}
      {renderField('Password', 'password', 'password')}

      <div className="space-y-1">
        <Label htmlFor="testMode">Mode</Label>

        <select
          id="testMode"
          name="testMode"
          value={values.testMode ? 'true' : 'false'}
          onChange={onChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="true">Test</option>
          <option value="false">Production</option>
        </select>
      </div>

      {config && (
        <p className="text-xs text-muted-foreground">
          Leave password empty to keep the current password.
        </p>
      )}

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