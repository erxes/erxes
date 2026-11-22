import type { VaultConnection } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
import { CONNECTION_CONTENT_TYPE } from 'erxes-ui';
import { z } from 'zod';
import { useSidePanelDraft } from '~/modules/side-panel/useSidePanel';
import { type Integration, useIntegrations } from '../integrations/catalog';

export interface ConnectionScope {
  integration?: string;
  category?: string;
}

const ConnectionDraft = z.object({
  integration: z.string().optional(),
  category: z.string().optional(),
  onConnected: z
    .custom<(connectionId: string) => void>((value) => typeof value === 'function')
    .optional(),
});

export type ConnectionDraft = z.infer<typeof ConnectionDraft>;

export const useConnectionDraft = (): ConnectionDraft =>
  ConnectionDraft.safeParse(useSidePanelDraft(CONNECTION_CONTENT_TYPE)).data ?? {};

export const useConnections = () =>
  useQuery(orpc.integrations.connections.queryOptions({ input: {} }));

const inScope = (integration: Integration, scope: ConnectionScope) =>
  integration.keyed &&
  (!scope.integration || integration.key === scope.integration) &&
  (!scope.category || integration.category === scope.category);

export const useKeyedIntegrations = (scope: ConnectionScope = {}) => {
  const { integrations, listed } = useIntegrations();

  return {
    loading: listed.isPending,
    integrations: integrations.filter((integration) => inScope(integration, scope)),
  };
};

export const connectionsOf = (connections: VaultConnection[], integrations: Integration[]) =>
  connections.flatMap((connection) => {
    const integration = integrations.find(({ key }) => key === connection.key);

    return integration ? [{ connection, integration }] : [];
  });
