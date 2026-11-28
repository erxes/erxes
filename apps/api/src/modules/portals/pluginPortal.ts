import { type Db, portalPlugins, portals } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { unknownPortal } from '~/modules/customerAuth/customerPortals';

/**
 * A portal the calling plugin is on, with how it emails and texts its customers: its sender
 * name, Mail service connection, From and Reply-To, SMS connection and web addresses. 400
 * UNKNOWN_PORTAL for another organisation's, or one the plugin isn't on.
 */
export const pluginPortal = async (client: Db, plugin: string, portalId: string) => {
  const [portal] = await client
    .select({
      id: portals.id,
      name: portals.name,
      senderName: portals.senderName,
      mailConnectionId: portals.mailConnectionId,
      fromEmail: portals.fromEmail,
      replyTo: portals.replyTo,
      smsConnectionId: portals.smsConnectionId,
      origins: portals.origins,
    })
    .from(portals)
    .innerJoin(
      portalPlugins,
      and(eq(portalPlugins.portalId, portals.id), eq(portalPlugins.plugin, plugin)),
    )
    .where(eq(portals.id, portalId))
    .limit(1);

  if (!portal) throw unknownPortal();

  return portal;
};

export type PluginPortal = Awaited<ReturnType<typeof pluginPortal>>;
