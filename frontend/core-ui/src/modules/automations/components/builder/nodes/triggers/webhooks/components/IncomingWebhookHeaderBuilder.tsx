import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const IncomingWebhookHeadersBuilder = ({
  headers = [],
  onChange,
}: {
  headers: TIncomingWebhookForm['headers'];
  onChange: (...event: any[]) => void;
}) => {
  const { t } = useTranslation('automations');
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

  if (!headers?.length) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <Form.Label>{t('headers', 'Headers')}</Form.Label>
          <IncomingWebhookHeaderAddButton
            onChange={onChange}
            headers={headers}
          />
        </div>
        <div className="text-sm text-muted-foreground text-center py-8">
          {t('no-headers-added-yet-click', 'No headers added yet. Click "Add Header" to get started.')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-between">
        <Form.Label>{t('headers', 'Headers')}</Form.Label>
        <IncomingWebhookHeaderAddButton onChange={onChange} headers={headers} />
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

const IncomingWebhookHeaderAddButton = ({
  onChange,
  headers,
}: {
  onChange: (headers: TIncomingWebhookForm['headers']) => void;
  headers: TIncomingWebhookForm['headers'];
}) => {
  const { t } = useTranslation('automations');
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        onChange([...(headers || []), { key: '', value: '', description: '' }])
      }
    >
      <IconPlus /> {t('add-header', 'Add Header')}
    </Button>
  );
};

const IncomingWebhookHeadersItem = ({
  index,
  header: { key, value, description },
  handleChange,
  handleRemove,
}: {
  index: number;
  header: NonNullable<TIncomingWebhookForm['headers']>[number];
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
