import type { EmailMessage } from '@erxes/core-contract';
import { caller, type Db, requestOrgId } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { pluginPortal } from '~/modules/portals/pluginPortal';
import { sendEmail } from './email';
import { mailRoute, requireMailConnection } from './mailConnections';
import { requireReplyTo } from './replyTos.service';
import { requireDelivery } from './sender';

/**
 * How a plugin's email goes: as its portal's emails do (`portalId`: the portal's connection,
 * Organization email while that is off, its sender name, From and Reply-To), through a Mail
 * service connection (`connectionId`), or through Organization email.
 */
const routeOf = async (tx: Db, plugin: string, input: EmailMessage) => {
  const { portalId, connectionId, replyTo } = input;

  if (portalId && connectionId) {
    const message = 'Send with portalId or connectionId, not both';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['connectionId'], message }] });
  }

  if (portalId) {
    const portal = await pluginPortal(tx, plugin, portalId);
    const route = await mailRoute(tx, portal.mailConnectionId);

    if (!route.deliverable) await requireDelivery(tx);

    return {
      connectionId: route.connectionId,
      fromName: portal.senderName ?? portal.name,
      // The portal's From is for Organization email; a connection sends from its own.
      fromEmail: route.connectionId ? undefined : (portal.fromEmail ?? undefined),
      replyTo: replyTo ?? portal.replyTo ?? undefined,
    };
  }

  if (connectionId) await requireMailConnection(tx, connectionId, ['connectionId']);
  else await requireDelivery(tx);

  return { connectionId: connectionId ?? null, replyTo };
};

/**
 * Queues a plugin's plain message to each address once, in the request's transaction; the email
 * job sends them. Answers the addresses and how they go, for the audit entry.
 */
export const sendPluginEmail = async (tx: Db, input: EmailMessage) => {
  const { plugin } = caller('plugin');
  const { to, replyTo: _replyTo, connectionId: _connection, portalId, ...data } = input;
  const { connectionId, ...sender } = await routeOf(tx, plugin, input);

  await requireReplyTo(tx, sender.replyTo);

  const addresses = [...new Set(to.map((address) => address.toLowerCase()))];

  await sendEmail(
    tx,
    requestOrgId(),
    addresses.map((address) => ({ to: address, template: 'message', ...sender, data })),
    { source: 'plugin', sourceId: plugin, connectionId },
  );

  return { addresses, replyTo: sender.replyTo ?? null, connectionId, portalId: portalId ?? null };
};
