import type { PortalSignIn } from '@erxes/core-contract';
import { withOrg } from '@erxes/core-db';
import { canDeliverEmail } from '~/modules/email/sender';
import { canDeliverSms } from '~/modules/sms/sms';
import type { SignInRequest } from './customerAuth.service';
import { portalFor } from './customerPortals';
import { socialSignInOf } from './signInConnections';

/** The id a portal's button starts the service's SDK with, or null when it is off or gone. */
const publicIdOf = async (orgId: string, connectionId: string | null) => {
  if (!connectionId) return null;

  const opened = await socialSignInOf(orgId, connectionId).catch(() => null);

  return opened ? opened.socialSignIn.publicId(opened.client) : null;
};

/** How the portal lets customers sign in now: what it turned on and what can reach them. */
export const signInMethods = async (
  input: { portal: string },
  request: SignInRequest,
): Promise<PortalSignIn> => {
  const portal = await portalFor(input.portal, request.origin);

  const { emails, texts } = await withOrg(portal.orgId, async (tx) => ({
    emails: await canDeliverEmail(tx),
    texts: await canDeliverSms(tx),
  }));

  const phone = !portal.phoneSignIn
    ? 'off'
    : portal.phoneConnectionId
      ? 'reply'
      : texts
        ? 'code'
        : 'off';

  const [googleClientId, appleServicesId, facebookAppId] = await Promise.all([
    publicIdOf(portal.orgId, portal.googleConnectionId),
    publicIdOf(portal.orgId, portal.appleConnectionId),
    publicIdOf(portal.orgId, portal.facebookConnectionId),
  ]);

  return {
    name: portal.name,
    email: portal.emailSignIn && emails,
    phone,
    googleClientId,
    appleServicesId,
    facebookAppId,
  };
};
