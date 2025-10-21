import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';

export const IncomingWebhookHeadersBuilder = ({
  headers = [],
  onChange,
}: {
  headers: TIncomingWebhookForm['headers'];
  onChange: (...event: any[]) => void;
}) => {
  const handleChange = (
    index: number,
    field: 'key' | 'value' | 'description',
    value: string,
  ) => {
    const updatedHeaders = [...(headers || [])];
    updatedHeaders[index] = {
      ...updatedHeaders[index],
      [field]: value,
    };
    onChange(updatedHeaders);
  };

  const handleRemove = (index: number) => {
    const updatedHeaders = (headers || []).filter((_, i) => i !== index);
    onChange(updatedHeaders);
  };

  return (
    <>
      <div className="flex flex-row justify-between">
        <Form.Label>Headers</Form.Label>
        <Button
          variant="outline"
          onClick={() =>
            onChange([
              ...(headers || []),
              { key: '', value: '', description: '' },
            ])
          }
        >
          <IconPlus /> Add Header
        </Button>
      </div>
      <div>
        <Form.Label className="w-1/4">Key</Form.Label>
        <Form.Label className="w-2/4">Value</Form.Label>
        <Form.Label className="w-1/4">Description</Form.Label>
      </div>
      {headers.map((header, index) => (
        <IncomingWebhookHeadersItem
          key={index}
          index={index}
          header={header}
          handleChange={handleChange}
          handleRemove={handleRemove}
        />
      ))}
    </>
  );
};

const IncomingWebhookHeadersItem = ({
  index,
  header: { key, value, description },
  handleChange,
  handleRemove,
}: {
  index: number;
  header: TIncomingWebhookForm['headers'][number];
  handleChange: (
    index: number,
    field: 'key' | 'value' | 'description',
    value: string,
  ) => void;
  handleRemove: (index: number) => void;
}) => {
  return (
    <div key={index} className="flex flex-row items-center gap-2 p-2">
      <Input
        value={key}
        placeholder="Key"
        className="w-1/4"
        onChange={(e) => handleChange(index, 'key', e.target.value)}
      />
      <Input
        value={value}
        placeholder="Value"
        className="w-2/4"
        onChange={(e) => handleChange(index, 'value', e.target.value)}
      />
      <Input
        value={description}
        placeholder="Description (Optional)"
        className="w-1/4"
        onChange={(e) => handleChange(index, 'description', e.target.value)}
      />
      <Button variant="destructive" onClick={() => handleRemove(index)}>
        <IconTrash />
      </Button>
    </div>
  );
};
