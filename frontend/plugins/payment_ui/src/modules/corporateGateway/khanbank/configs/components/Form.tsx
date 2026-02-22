import { useState } from 'react';
import { Button, Input, Label } from 'erxes-ui';
import { IKhanbankConfigsItem } from '../types';

type Props = {
  config?: IKhanbankConfigsItem;
  onSubmit: (values: any, object?: IKhanbankConfigsItem) => void;
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
    name: config?.name ?? '',
    description: config?.description ?? '',
    consumerKey: config?.consumerKey ?? '',
    secretKey: config?.secretKey ?? '',
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
      {renderField('Name', 'name')}
      {renderField('Description', 'description')}
      {renderField('Consumer Key', 'consumerKey')}
      {renderField('Secret Key', 'secretKey', 'password')}

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