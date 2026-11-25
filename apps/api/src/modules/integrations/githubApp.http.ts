import { enterScope, withOrg } from '@erxes/core-db';
import { type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { appLink } from '~/modules/email/email';
import { userInstallations, userToken } from './githubApp';
import { connectInstallation, ticketFor } from './githubAppConnect';
import { openState } from './oauth';
import { startedHere } from './oauth.http';

/** GitHub's Callback URL and Setup URL: a sign-in, or an App just installed with one. */
const GITHUB_APP_CALLBACK = '/integrations/github/app/callback';

const Query = z.object({
  state: z.string().max(4000).optional(),
  code: z.string().max(4000).optional(),
  installation_id: z.coerce.number().int().positive().optional(),
});

const settings = (orgId: string, query: Record<string, string>) =>
  withOrg(orgId, (tx) =>
    appLink(tx, `/settings/integrations/github?${new URLSearchParams(query).toString()}`),
  );

/**
 * Lists the App's installations the member manages on GitHub, which proves they may connect
 * them. One just installed is connected at once; otherwise Settings shows the list to pick from.
 */
const callback: RequestHandler = async (req, res) => {
  const query = Query.safeParse(req.query);
  const state = query.success && query.data.state ? openState(query.data.state) : null;

  if (!query.success || state?.key !== 'github')
    return res
      .status(400)
      .type('text/plain')
      .send('This sign-in expired. Start again from Settings.');

  const member = await startedHere(req, state);

  if (!member)
    return res
      .status(403)
      .type('text/plain')
      .send(
        'This sign-in was started by another erxes account or browser. Start again from Settings.',
      );

  const { code, installation_id: installed } = query.data;

  if (!code) return res.redirect(await settings(state.orgId, { error: 'denied' }));

  try {
    const back = await enterScope(
      member,
      state.orgId,
      async (): Promise<Record<string, string>> => {
        const installations = await userInstallations(await userToken(code));
        const fresh = installations.find((item) => item.id === installed);

        return fresh
          ? { connected: (await connectInstallation(fresh)).id }
          : { github: ticketFor(installations) };
      },
    );

    res.redirect(await settings(state.orgId, back));
  } catch (error) {
    req.log.warn({ err: error }, 'GitHub App sign-in failed');

    res.redirect(await settings(state.orgId, { error: 'failed' }));
  }
};

export const githubAppRouter = Router().get(GITHUB_APP_CALLBACK, callback);
