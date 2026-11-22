import { newId, roles, runAs, users, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { appLink } from '~/modules/email/email';
import { insertConnection } from './integrations.service';
import { exchangeCode, openState } from './oauth';

const Query = z.object({
  state: z.string().max(4000).optional(),
  code: z.string().max(4000).optional(),
  error: z.string().max(200).optional(),
});

type State = NonNullable<ReturnType<typeof openState>>;

const memberOf = async (tx: Parameters<Parameters<typeof withOrg>[1]>[0], userId: string) => {
  const [row] = await tx
    .select({ role: users.role, status: users.status, permissions: roles.permissions })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(eq(users.id, userId))
    .limit(1);

  return row?.status === 'active'
    ? { type: 'user' as const, userId, role: row.role, permissions: row.permissions }
    : null;
};

const finish = (state: State, code: string) =>
  withOrg(state.orgId, async (tx) => {
    const page = (query: string) => appLink(tx, `/settings/integrations/${state.key}?${query}`);
    const member = await memberOf(tx, state.userId);

    if (!member) return page('error=signed-out');

    return runAs(member, async () => {
      const { integration, keys } = await exchangeCode(tx, state, code);

      const connection = await insertConnection(tx, integration, {
        id: newId(),
        name: state.name,
        keys,
      });

      return page(`connected=${connection.id}`);
    });
  });

const callback: RequestHandler = async (req, res) => {
  const query = Query.safeParse(req.query);
  const state = query.success && query.data.state ? openState(query.data.state) : null;

  if (!state) {
    res.status(400).type('text/plain').send('This sign-in expired. Start again from Settings.');

    return;
  }

  const code = query.data?.code;

  if (!code) {
    const back = await withOrg(state.orgId, (tx) =>
      appLink(tx, `/settings/integrations/${state.key}?error=${query.data?.error ?? 'denied'}`),
    );

    res.redirect(back);

    return;
  }

  try {
    res.redirect(await finish(state, code));
  } catch (error) {
    req.log.warn({ err: error, integration: state.key }, 'integration sign-in failed');

    const back = await withOrg(state.orgId, (tx) =>
      appLink(tx, `/settings/integrations/${state.key}?error=failed`),
    );

    res.redirect(back);
  }
};

export const oauthCallbackRouter = Router().get('/integrations/oauth/callback', callback);
