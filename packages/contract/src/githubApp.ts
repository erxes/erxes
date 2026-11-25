import { oc } from '@orpc/contract';
import { z } from 'zod';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationConnection } from './integrations';

const base = oc.errors({ ...COMMON_ERRORS, NOT_SET_UP: ERRORS.NOT_SET_UP });

/**
 * GitHub for the whole organisation, through the server's GitHub App: the member signs in to
 * GitHub, picks one of the accounts the App is installed on, and erxes acts as the App there.
 */
export const githubAppContract = {
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
