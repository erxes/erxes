import { type Db, pluginInstallations, plugins, type StoredPluginManifest } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { postOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';
import { type CallContext, idempotencyKey, parseBody } from './context';

export const CORE_CALL_TYP = 'erxes-core-call+jwt';

export interface ActionPlugin {
  name: string;
  manifest: StoredPluginManifest | null;
}

/** The plugin that owns an action type (`<plugin>.<…>`), active in the organisation, or an error. */
export const pluginForAction = async (tx: Db, orgId: string, type: string) => {
  const name = type.split('.')[0] ?? '';

  const [row] = await tx
    .select({
      name: plugins.name,
      manifest: plugins.manifest,
      status: pluginInstallations.status,
    })
    .from(plugins)
    .innerJoin(
      pluginInstallations,
      and(eq(pluginInstallations.plugin, plugins.name), eq(pluginInstallations.orgId, orgId)),
    )
    .where(eq(plugins.name, name))
    .limit(1);

  if (row?.status !== 'active' || !row.manifest?.actions?.some((action) => action.type === type))
    throw new Error(`No action ${type} (is its plugin installed?)`);

  return { name: row.name, manifest: row.manifest };
};

/**
 * A plugin's action: POST `{ input, context }` to
 * `<api.url>/automations/actions/<type>` with a 5-minute core token (`aud` the
 * plugin) and an `Idempotency-Key` (`<run>:<step>`), so a retry is safe.
 */
export const runPluginAction = async (ctx: CallContext, plugin: ActionPlugin, type: string) => {
  const url = plugin.manifest?.api?.url;

  if (!url) throw new Error(`${plugin.name} has no API address in its manifest`);

  const token = await signJwt(
    {
      org: ctx.orgId,
      user: ctx.actor.userId,
      automation: ctx.automation.id,
      run: ctx.run.id,
      step: ctx.step.id,
    },
    {
      typ: CORE_CALL_TYP,
      audience: plugin.name,
      subject: `automation:${ctx.automation.id}`,
      expiresInSeconds: 300,
    },
  );

  const response = await postOutbound(
    `${url.replace(/\/+$/, '')}/automations/actions/${type}`,
    JSON.stringify({
      input: ctx.input,
      context: { event: ctx.context.event, subject: ctx.context.subject, steps: ctx.context.steps },
    }),
    {
      'Content-Type': 'application/json',
      'User-Agent': 'erxes-automations/1',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': idempotencyKey(ctx),
    },
    30_000,
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${plugin.name} answered ${response.status}: ${response.body.slice(0, 300)}`);
  }

  return parseBody(response.body);
};
