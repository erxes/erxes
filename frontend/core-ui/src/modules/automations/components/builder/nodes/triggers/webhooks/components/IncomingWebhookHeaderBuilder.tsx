import {
  TIncomingWebhookHeaderField,
  TIncomingWebhookHeaders,
  useIncomingWebhookHeaders,
} from '@/automations/components/builder/nodes/triggers/webhooks/hooks/useIncomingWebhookHeaders';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const IncomingWebhookHeadersBuilder = ({
  headers: value = [],
  onChange,
}: {
  headers: TIncomingWebhookHeaders;
  onChange: (headers: TIncomingWebhookHeaders) => void;
}) => {
  const { t } = useTranslation('automations');
  const { headers, hasHeaders, addHeader, changeHeader, removeHeader } =
    useIncomingWebhookHeaders(value, onChange);

  if (!hasHeaders) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <Form.Label>{t('headers')}</Form.Label>
          <IncomingWebhookHeaderAddButton onAdd={addHeader} />
        </div>
        <div className="text-sm text-muted-foreground text-center py-8">
          {t('webhook-headers-empty')}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-between">
        <Form.Label>{t('headers')}</Form.Label>
        <IncomingWebhookHeaderAddButton onAdd={addHeader} />
      </div>
      <div>
        <Form.Label className="w-1/4">
          {t('webhook-trigger-header-key')}
        </Form.Label>
        <Form.Label className="w-2/4">{t('value')}</Form.Label>
        <Form.Label className="w-1/4">{t('description')}</Form.Label>
      </div>
      {headers.map((header, index) => (
        <IncomingWebhookHeadersItem
          key={index}
          index={index}
          header={header}
          onFieldChange={changeHeader}
          onRemove={removeHeader}
        />
      ))}
    </>
  );
};

const IncomingWebhookHeaderAddButton = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslation('automations');

  return (
    <Button size="sm" variant="outline" onClick={onAdd}>
      <IconPlus /> {t('webhook-add-header')}
    </Button>
  );
};

const IncomingWebhookHeadersItem = ({
  index,
  header: { key, value, description },
  onFieldChange,
  onRemove,
}: {
  index: number;
  header: NonNullable<TIncomingWebhookHeaders>[number];
  onFieldChange: (
    index: number,
    field: TIncomingWebhookHeaderField,
    value: string,
  ) => void;
  onRemove: (index: number) => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex flex-row items-center gap-2 p-2">
      <Input
        value={key}
        placeholder={t('webhook-trigger-header-key')}
        className="w-1/4"
        onChange={(e) => onFieldChange(index, 'key', e.target.value)}
      />
      <Input
        value={value}
        placeholder={t('value')}
        className="w-2/4"
        onChange={(e) => onFieldChange(index, 'value', e.target.value)}
      />
      <Input
        value={description}
        placeholder={t('webhook-trigger-header-description-placeholder')}
        className="w-1/4"
        onChange={(e) => onFieldChange(index, 'description', e.target.value)}
      />
      <Button variant="destructive" onClick={() => onRemove(index)}>
        <IconTrash />
      </Button>
    </div>
  );
};
