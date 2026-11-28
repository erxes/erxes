import { type Caller, runAs, withOrg } from '@erxes/core-db';
import { type Request, type RequestHandler, type Response, Router } from 'express';
import { z } from 'zod';
import { config } from '~/config';
import { memberOf, sessionClaims } from '~/http/auth';
import { appLink } from '~/modules/email/email';
import { exchangeCode, openState, signInApp } from './oauth';
import { saveSignIn } from './signIns';

const CALLBACK = '/integrations/oauth/callback';

const FINISH = '/integrations/oauth/finish';

const EXPIRED = 'This sign-in expired. Start again from Settings.';

const ELSEWHERE =
  'This sign-in was started by another erxes account or browser. Start again from Settings.';

const Query = z.object({
  state: z.string().max(4000).optional(),
  code: z.string().max(4000).optional(),
  error: z.string().max(200).optional(),
});

type State = NonNullable<ReturnType<typeof openState>>;

const signInOf = (req: Request) => {
  const query = Query.safeParse(req.query);
  const state = query.success && query.data.state ? openState(query.data.state) : null;

  return state && { state, code: query.data?.code, error: query.data?.error };
};

const refuse = (res: Response, status: number, text: string) => {
  res.status(status).type('text/plain').send(text);
};

export const startedHere = async (req: Request, state: State) => {
  const session = await sessionClaims(req);

  if (session?.userId !== state.userId || session.orgId !== state.orgId) return null;

  return memberOf(session.orgId, session.userId, session.sessionVersion);
};

const settingsPage = (state: State, query: Record<string, string>) =>
  withOrg(state.orgId, (tx) =>
    appLink(tx, `/settings/integrations/${state.key}?${new URLSearchParams(query).toString()}`),
  );

const connect = (member: Caller, state: State, code: string) =>
  runAs(member, async () => {
    const app = await withOrg(state.orgId, (tx) => signInApp(tx, state.key));
    const { keys } = await exchangeCode(app, state, code);

    const connection = await withOrg(state.orgId, (tx) =>
      saveSignIn(tx, app.integration, {
        orgId: state.orgId,
        name: state.name,
        scope: state.scope,
        keys,
      }),
    );

    return connection.id;
  });

const finish: RequestHandler = async (req, res) => {
  const signIn = signInOf(req);

  if (!signIn) return refuse(res, 400, EXPIRED);

  const { state, code } = signIn;
  const member = await startedHere(req, state);

  if (!member) return refuse(res, 403, ELSEWHERE);

  if (!code) return res.redirect(await settingsPage(state, { error: signIn.error ?? 'denied' }));

  try {
    res.redirect(await settingsPage(state, { connected: await connect(member, state, code) }));
  } catch (error) {
    req.log.warn({ err: error, integration: state.key }, 'integration sign-in failed');

    res.redirect(await settingsPage(state, { error: 'failed' }));
  }
};

const callback: RequestHandler = async (req, res, next) => {
  const signIn = signInOf(req);

  if (!signIn) return refuse(res, 400, EXPIRED);

  if (!config.integrations.oauthCallbackUrl) return finish(req, res, next);

  const { search } = new URL(req.originalUrl, 'http://core');

  return res.redirect(
    await withOrg(signIn.state.orgId, (tx) => appLink(tx, `/core/v1${FINISH}${search}`)),
  );
};

export const oauthCallbackRouter = Router().get(CALLBACK, callback).get(FINISH, finish);
