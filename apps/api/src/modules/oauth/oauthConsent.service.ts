import { caller, type Db, organizations, scopedOrgId } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { answerTo, consentOf, issueCode } from './oauthAuthorize';

/** The request the consent page answers, if it is still the signed-in member's own. */
const authorizationOf = async (request: string) => {
  const consent = await consentOf(request);
  const { userId } = caller('user');

  if (!consent || consent.sub !== userId || consent.org !== scopedOrgId()) {
    throw fail(
      'APP_REQUEST_INVALID',
      'This request expired or is not yours: start again from the app',
    );
  }

  return { ...consent, userId };
};

export const describeConsent = async (client: Db, request: string) => {
  const { authorization, app } = await authorizationOf(request);

  const [organisation] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .limit(1);

  return {
    app: app.title,
    address: app.address,
    redirectHost: new URL(authorization.redirectUri).host,
    organisation: organisation?.name ?? '',
  };
};

/** The member's answer: a code for the app, or access_denied, at its redirect address. */
export const decideConsent = async (client: Db, request: string, allow: boolean) => {
  const { authorization, userId } = await authorizationOf(request);

  const redirectTo = allow
    ? answerTo(authorization, { code: await issueCode(client, authorization, userId) })
    : answerTo(authorization, {
        error: 'access_denied',
        error_description: 'The member did not allow the app',
      });

  return { redirectTo };
};
