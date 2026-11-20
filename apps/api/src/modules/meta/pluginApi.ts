import type { MetaGraphInput, MetaImportInput } from '@erxes/core-contract';
import { type Db, metaConnections, metaPeople, newId } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import type { z } from 'zod';
import { fail } from '~/http/errors';
import { seal } from '~/lib/secrets';
import { inOrder } from '~/lib/sequence';
import { saveApp } from './app.service';
import { type ConnectionRow, openConnection } from './connections.service';
import { graphCall } from './graph';

const EDGE = /^[a-z][a-z_]{0,59}$/;

const FORBIDDEN_QUERY = new Set(['access_token', 'appsecret_proof', 'appsecret_time']);

const ownNode = (row: ConnectionRow, node: string) =>
  node === 'me' ||
  node === row.externalId ||
  node === row.pageId ||
  (node.startsWith(`${row.pageId}_`) && /^\d+$/.test(node.slice(row.pageId.length + 1)));

const allowedPath = (row: ConnectionRow, path: string) => {
  const [node = '', edge, ...rest] = path.replace(/^\/+/, '').split('/');

  return rest.length === 0 && ownNode(row, node) && (edge === undefined || EDGE.test(edge));
};

export const guardedGraph = async (orgId: string, input: z.infer<typeof MetaGraphInput>) => {
  const { row, token } = await openConnection(orgId, input.connectionId);

  if (!allowedPath(row, input.path))
    throw fail(
      'GRAPH_PATH_NOT_ALLOWED',
      "Only the connection's own node, the page's posts and their edges",
    );

  if (Object.keys(input.query).some((key) => FORBIDDEN_QUERY.has(key.toLowerCase())))
    throw fail('GRAPH_PATH_NOT_ALLOWED', 'The connection’s token is added by core');

  return graphCall(input.path, token, {
    method: input.method,
    query: input.query,
    body: input.body,
  });
};

export const importMeta = async (client: Db, input: z.infer<typeof MetaImportInput>) => {
  if (input.app) await saveApp(client, input.app);

  await inOrder(input.connections, async (connection) => {
    const values = {
      pageId: connection.pageId,
      name: connection.name,
      username: connection.username ?? null,
      tokenSealed: seal(connection.pageToken),
      app: connection.app,
      status: connection.status,
      statusReason: connection.statusReason ?? null,
      updatedAt: sql`now()`,
    };

    await client
      .insert(metaConnections)
      .values({ ...values, id: newId(), kind: connection.kind, externalId: connection.externalId })
      .onConflictDoUpdate({
        target: [metaConnections.orgId, metaConnections.kind, metaConnections.externalId],
        set: values,
      });
  });

  if (input.people.length)
    await client
      .insert(metaPeople)
      .values(input.people)
      .onConflictDoUpdate({
        target: [metaPeople.orgId, metaPeople.kind, metaPeople.externalId],
        set: { customerId: sql`excluded.customer_id` },
      });

  return { connections: input.connections.length, people: input.people.length };
};
