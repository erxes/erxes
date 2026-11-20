import { orpc } from '@erxes/core-contract/client';
import { queryOptions } from '@tanstack/react-query';
import { pluginJson } from 'erxes-ui';
import { z } from 'zod';

const PluginRecords = z.array(z.object({ value: z.string(), label: z.string() }));

const fetchChoices = (source: string, recordType: string, parent: string) => {
  if (source === 'core') {
    return orpc.automations.recordChoices.call({ recordType, parent: parent || undefined });
  }

  const query = new URLSearchParams(parent ? { parent } : {});

  return pluginJson(source, `/automations/records/${recordType}?${query}`, PluginRecords);
};

export const recordChoicesQuery = (source: string, recordType: string, parent = '') =>
  queryOptions({
    queryKey: ['plugin-records', source, recordType, parent],
    queryFn: () => fetchChoices(source, recordType, parent),
    staleTime: 60_000,
  });
