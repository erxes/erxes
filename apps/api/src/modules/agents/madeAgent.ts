import { defineExtension, GenerationTask, hook, section } from '@earendil-works/pi-durable';
import { apiKeys, type Db, portalPlugins, portals, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { keyCaller } from '~/modules/apiKeys/keyCaller';
import { modelKey } from '~/modules/assistant/connections.service';
import { installedPlugins } from '~/modules/assistant/plugins';
import { modelsFor } from '~/modules/assistant/providers';
import { apiTools } from '~/modules/assistant/tools/apiTools';
import { agentCustomerToken } from '~/modules/customerAuth/customerSessions';
import { agentPortalToken } from '~/modules/portals/portalKeys';
import { type Agent, answerText, madeAgentName } from './agent';
import { agentOrThrow, chatOf, notifyRun } from './agents.service';
import { runEntries, showTool, shownBlocks } from './blocks';

const GUIDE = `Use searchApi to find what you can do and callApi to do it. Your access is limited to what an admin allowed; when something is refused, say you can't do it and offer to hand the conversation to a person. Keep replies short and plain. Never make up prices, stock, dates or order details: read them from the API or your instructions. To show a product, a picture or a payment link, call show with what they gave you.`;

/** Read each turn, so a booking agent turns "next Friday" into a date. */
const todayLine = (now: Date) =>
  `Today is ${now.toISOString().slice(0, 10)} (UTC). Work out dates such as "next Friday" from it, and read them back with the year.`;

const CUSTOMER_GUIDE = `You are talking with one customer of the portal. Their own orders, bookings and profile are under the portal and customer procedures (names with ":portal:" or ":customer:"), which act as them. Never look up other customers' records.`;

/** The portal with its plugins, or null once the portal is gone. */
const portalOf = async (client: Db, id: string | null) => {
  const rows = id
    ? await client
        .select({ id: portals.id, plugin: portalPlugins.plugin })
        .from(portals)
        .leftJoin(portalPlugins, eq(portalPlugins.portalId, portals.id))
        .where(eq(portals.id, id))
    : [];

  const [first] = rows;

  return first
    ? { id: first.id, plugins: rows.flatMap((row) => (row.plugin ? [row.plugin] : [])) }
    : null;
};

/** The key's caller now, or null once the key, its maker or the maker's role is gone. */
const keyCallerOf = async (client: Db, keyId: string) => {
  const [key] = await client.select().from(apiKeys).where(eq(apiKeys.id, keyId)).limit(1);
  const decided = key ? await keyCaller(client, key, null, { anyAddress: true }) : null;

  return decided && 'caller' in decided ? decided.caller : null;
};

/**
 * An agent an admin made. It calls the API by its key's rules, and when it serves customers and
 * the conversation is with one, also the plugins' portal and customer routes as that customer.
 * A run's answer goes to the plugin that talks in the conversation as `core.agent.finished`.
 */
export const madeAgent = (id: string): Agent => ({
  name: madeAgentName(id),
  setup: (scope) =>
    withOrg(scope.orgId, async (tx) => {
      const row = await agentOrThrow(tx, id);
      const chat = await chatOf(tx, id, scope.key);

      const key = await modelKey(tx, {
        provider: row.provider ?? undefined,
        model: row.model ?? undefined,
      });

      const plugins = await installedPlugins(tx);
      const portal = await portalOf(tx, row.portalId);
      const customerId = portal ? chat?.customerId : null;

      const tools = apiTools({
        caller: () => withOrg(scope.orgId, (client) => keyCallerOf(client, row.keyId)),
        orgId: scope.orgId,
        threadId: null,
        codeMode: false,
        plugins,
        ...(portal && customerId
          ? {
              customer: {
                plugins: portal.plugins,
                credentials: async () => ({
                  authorization: `Bearer ${await agentCustomerToken(
                    { orgId: scope.orgId, customerId, portalId: portal.id },
                    id,
                  )}`,
                  'x-portal-token': await agentPortalToken(scope.orgId, portal.id, id),
                }),
              },
            }
          : {}),
      });

      const extension = defineExtension({
        name: 'made-agent',
        tools: [...tools, showTool],
        sections: [
          section(
            'agent',
            () =>
              [
                row.instructions,
                GUIDE,
                todayLine(new Date()),
                ...(customerId ? [CUSTOMER_GUIDE] : []),
              ].join('\n\n'),
            { tag: false },
          ),
        ],
        hooks: [
          hook(GenerationTask, {
            afterRun: async (run, api, context) => {
              if (chat) {
                const answer = answerText(await api.entry(run.answer, context));

                await notifyRun(scope.orgId, 'core.agent.finished', {
                  agentId: id,
                  plugin: chat.plugin,
                  key: scope.key,
                  answer,
                  blocks: shownBlocks(await runEntries(api, run.first, run.last)),
                });
              }

              return undefined;
            },
          }),
        ],
      });

      return {
        models: modelsFor([key]),
        extensions: [extension],
        agent: { extensions: [extension], model: { provider: key.provider, modelId: key.model } },
      };
    }),
});
