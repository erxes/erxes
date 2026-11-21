import { orpc } from '@erxes/core-contract/client';
import { pluginJson } from 'erxes-ui';
import { z } from 'zod';
import type { FieldInfo } from './useAutomationFields';

export interface Choice {
  value: string;
  label: string;
  broken?: boolean;
}

const PluginRecords = z.array(z.object({ value: z.string(), label: z.string() }));

interface AccountSource {
  integration: string;
  accountKind?: string;
}

export const accountChoicesQuery = ({ integration, accountKind }: AccountSource) => ({
  queryKey: [...orpc.integrationAccounts.choices.key(), integration, accountKind ?? ''],
  queryFn: async (): Promise<Choice[]> =>
    (await orpc.integrationAccounts.choices.call({ integration, kind: accountKind })).data.map(
      (account) => ({
        value: account.id,
        label: [account.name, account.detail].filter(Boolean).join(' · '),
        broken: account.status === 'broken',
      }),
    ),
  staleTime: 60_000,
});

export const pluginRecordsQuery = (source: string, recordType: string, parent = '') => ({
  queryKey: ['plugin-records', source, recordType, parent],
  queryFn: (): Promise<Choice[]> =>
    pluginJson(
      source,
      `/automations/records/${recordType}${parent ? `?${new URLSearchParams({ parent })}` : ''}`,
      PluginRecords,
    ),
  staleTime: 60_000,
});

export const hasChoices = (field: FieldInfo) =>
  Boolean(field.integration || (field.recordType && field.source));

export const choicesKey = (field: FieldInfo) =>
  field.integration
    ? `account:${field.integration}:${field.accountKind ?? ''}`
    : `record:${field.source}:${field.recordType}`;

export const choicesQuery = (field: FieldInfo) =>
  field.integration
    ? accountChoicesQuery({ integration: field.integration, accountKind: field.accountKind })
    : pluginRecordsQuery(field.source ?? '', field.recordType ?? '');
