import { OAUTH_CLIENT_SOURCES } from '@erxes/core-db/enums';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationConnection } from './integrations';

const { APP_IN_USE, GATEWAY_REFUSED, NOT_SET_UP } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, APP_IN_USE, GATEWAY_REFUSED, NOT_SET_UP });

/** Which GitHub App the organisation connects through. */
export const GithubAppFacts = z.object({
  /** `server`: GITHUB_APP_* in .env; `organization`: its own, set in Settings; null: none yet. */
  source: z.enum(OAUTH_CLIENT_SOURCES).nullable(),
  slug: z.string().nullable(),
  /** The organisation's own App's ids; null for the server's, which stay out of sight. */
  appId: z.string().nullable(),
  clientId: z.string().nullable(),
  /** The App's Callback URL on GitHub. */
  callbackUrl: z.string(),
  /** Organisation connections run on the organisation's own App: it can't change. */
  inUse: z.boolean(),
});

export type GithubAppFacts = z.infer<typeof GithubAppFacts>;

const facts = base.output(GithubAppFacts);

/** The organisation's own App, as GitHub shows it on the App's page. */
export const GithubAppInput = z.object({
  appId: z.string().trim().regex(/^\d+$/, 'the App ID, digits only'),
  clientId: z.string().trim().min(1).max(100),
  clientSecret: z.string().trim().min(1).max(200),
  privateKey: z.string().trim().min(1).max(10_000),
});

/**
 * GitHub for the whole organisation, through the server's GitHub App: the member signs in to
 * GitHub, picks one of the accounts the App is installed on, and erxes acts as the App there.
 */
export const githubAppContract = {
  app: facts.route({
    method: 'GET',
    path: '/integrations/github/app',
    summary: 'Read which GitHub App the organisation uses',
    description:
      "The server's App (GITHUB_APP_* in .env) or the organisation's own, with the Callback URL to give it; the server's ids stay out of sight",
  }),
  setApp: facts
    .route({
      method: 'PUT',
      path: '/integrations/github/app',
      summary: "Set the organisation's own GitHub App",
      description:
        'For a server without GITHUB_APP_* in .env: GitHub checks the App id and private key first. 400 GATEWAY_REFUSED, 409 APP_IN_USE while organisation connections use another App',
    })
    .input(GithubAppInput),
  removeApp: facts.route({
    method: 'DELETE',
    path: '/integrations/github/app',
    summary: "Remove the organisation's own GitHub App",
    description: '409 APP_IN_USE while organisation connections use it',
  }),
  signIn: base
    .route({
      method: 'POST',
      path: '/integrations/github/app/sign-in',
      summary: 'Start a GitHub sign-in to pick an installation',
      description:
        "Where to send the member to sign in to GitHub; GitHub sends them back to Settings with the App's installations they manage, in a signed `ticket`. 400 NOT_SET_UP without a GitHub App on the server",
    })
    .output(z.object({ url: z.string() })),
  connect: base
    .route({
      method: 'POST',
      path: '/integrations/github/app/connections',
      successStatus: 201,
      summary: 'Connect one of the App’s installations',
      description:
        'The organisation’s GitHub connection for one installation from the ticket; connecting it again renews it',
    })
    .input(z.object({ ticket: z.string().min(1).max(20_000), installationId: z.int().positive() }))
    .output(IntegrationConnection),
};
