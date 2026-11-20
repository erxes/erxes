import type { MetaKind } from '@erxes/core-contract';
import { metaConnections, withSystem } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { config } from '~/config';
import { requestOutbound } from '~/lib/outbound';

const relayCall = async (method: 'PUT' | 'DELETE', kind: MetaKind, id: string) => {
  const { relay } = config.meta;

  if (!relay) return;

  const answer = await requestOutbound(`${relay.url}/v1/routes/${kind}/${encodeURIComponent(id)}`, {
    method,
    body: method === 'PUT' ? JSON.stringify({ url: relay.webhookUrl }) : '',
    headers: { authorization: `Bearer ${relay.key}`, 'content-type': 'application/json' },
    timeoutMs: 15_000,
  });

  if (answer.status === 404 && method === 'DELETE') return;

  if (answer.status < 200 || answer.status >= 300)
    throw new Error(`The Meta relay answered ${answer.status}`);
};

export const routeThroughRelay = (kind: MetaKind, id: string) => relayCall('PUT', kind, id);

export const unrouteFromRelay = async (kind: MetaKind, id: string) => {
  const [still] = await withSystem('meta relay route check', (tx) =>
    tx
      .select({ id: metaConnections.id })
      .from(metaConnections)
      .where(
        and(
          eq(metaConnections.kind, kind),
          eq(metaConnections.externalId, id),
          eq(metaConnections.app, 'install'),
        ),
      )
      .limit(1),
  );

  if (!still) await relayCall('DELETE', kind, id);
};
