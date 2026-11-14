import { TIncomingWebhookForm } from '@/automations/components/builder/nodes/triggers/webhooks/states/automationIncomingWebhookFormDefinition';
import { useCallback } from 'react';

export type TIncomingWebhookHeaders = TIncomingWebhookForm['headers'];
export type TIncomingWebhookHeaderField = 'key' | 'value' | 'description';

const EMPTY_HEADER = { key: '', value: '', description: '' };

/** Adding, editing and removing the headers an incoming webhook expects. */
export const useIncomingWebhookHeaders = (
  headers: TIncomingWebhookHeaders = [],
  onChange: (headers: TIncomingWebhookHeaders) => void,
) => {
  const list = headers || [];

  const addHeader = useCallback(
    () => onChange([...list, EMPTY_HEADER]),
    [list, onChange],
  );

  const changeHeader = useCallback(
    (index: number, field: TIncomingWebhookHeaderField, value: string) =>
      onChange(
        list.map((header, current) =>
          current === index ? { ...header, [field]: value } : header,
        ),
      ),
    [list, onChange],
  );

  const removeHeader = useCallback(
    (index: number) => onChange(list.filter((_, current) => current !== index)),
    [list, onChange],
  );

  return {
    headers: list,
    hasHeaders: list.length > 0,
    addHeader,
    changeHeader,
    removeHeader,
  };
};
