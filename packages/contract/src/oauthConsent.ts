import { oc } from '@orpc/contract';
import { z } from 'zod';
import { COMMON_ERRORS, ERRORS } from './errors';

const { APP_REQUEST_INVALID } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, APP_REQUEST_INVALID });

/** The signed request `/core/v1/oauth/authorize` sends the member to the consent page with. */
const ConsentRequest = z.object({ request: z.string().min(1).max(8000) });

/** An app asking to act as the member through the MCP server, as the consent page shows it. */
export const AppConsent = z.object({
  /** The name the app gives itself. */
  app: z.string(),
  /** The host that published the app's metadata document; null for one that registered itself. */
  address: z.string().nullable(),
  /** Where the browser goes back to after the member answers. */
  redirectHost: z.string(),
  organisation: z.string(),
});

export type AppConsent = z.infer<typeof AppConsent>;

/**
 * An app such as Claude or ChatGPT asks to act as the member through the MCP server: the member
 * allows or refuses it here, for themselves, in the organisation they are signed in to.
 */
export const oauthConsentContract = {
  get: base
    .route({
      method: 'GET',
      path: '/oauth-consent',
      summary: 'Show an app’s request',
      description:
        'The app asking to act as the member, from the request the authorize step signed for them. 400 APP_REQUEST_INVALID for an expired or altered request or another member’s',
    })
    .input(ConsentRequest)
    .output(AppConsent),
  decide: base
    .route({
      method: 'POST',
      path: '/oauth-consent',
      summary: 'Allow or refuse an app',
      description:
        'Allowing gives the app a one-time code at its redirect address, for tokens that act as the member through the MCP server; refusing sends it access_denied. Either way the answer is where the browser goes next',
    })
    .input(ConsentRequest.extend({ allow: z.boolean() }))
    .output(z.object({ redirectTo: z.string() })),
};
