import { integrationConnections, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { clientOf, connectionsWithSecret } from '~/modules/integrations/connections';
import { keyedOf } from '~/modules/integrations/registry';

const unavailable = () =>
  fail('SIGN_IN_UNAVAILABLE', "This portal's sign-in service is turned off or gone");

/**
 * A portal's sign-in connection opened in a short scope of its organisation: its integration and
 * client, to call the service after the scope ends. 400 SIGN_IN_UNAVAILABLE when it is gone or off.
 */
const openSignInConnection = async (orgId: string, connectionId: string) => {
  const opened = await withOrg(orgId, async (tx) => {
    const [row] = await connectionsWithSecret(tx)
      .where(
        and(
          eq(integrationConnections.id, connectionId),
          eq(integrationConnections.status, 'active'),
        ),
      )
      .limit(1);

    if (!row) return null;

    const integration = keyedOf(row.key);

    return { integration, client: await clientOf(tx, integration, row) };
  });

  if (!opened) throw unavailable();

  return opened;
};

/** The connection's social sign-in, or 400 SIGN_IN_UNAVAILABLE. */
export const socialSignInOf = async (orgId: string, connectionId: string) => {
  const { integration, client } = await openSignInConnection(orgId, connectionId);

  if (!integration.socialSignIn) throw unavailable();

  return { socialSignIn: integration.socialSignIn, client };
};

/** The connection's phone reply (verify.mn), or 400 SIGN_IN_UNAVAILABLE. */
export const phoneReplyOf = async (orgId: string, connectionId: string) => {
  const { integration, client } = await openSignInConnection(orgId, connectionId);

  if (!integration.phoneReply) throw unavailable();

  return { phoneReply: integration.phoneReply, client };
};
