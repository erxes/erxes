import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';

type THeaders = TOutgoingWebhookForm['headers'];
type THeader = THeaders[number];

export const withHeaderAdded = (headers: THeaders): THeaders => [
  ...headers,
  { key: '', value: '' },
];

export const withHeaderChanged = (
  headers: THeaders,
  index: number,
  patch: Partial<THeader>,
): THeaders =>
  headers.map((header, current) =>
    current === index ? { ...header, ...patch } : header,
  );

export const withoutHeader = (headers: THeaders, index: number): THeaders =>
  headers.filter((_, current) => current !== index);
