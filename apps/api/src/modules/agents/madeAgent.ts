import { defineExtension, GenerationTask, hook, section } from '@earendil-works/pi-durable';
import { apiKeys, type Db, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { keyCaller } from '~/modules/apiKeys/keyCaller';
import { installedPlugins } from '~/modules/assistant/plugins';
import { modelsFor } from '~/modules/assistant/providers';
import { apiTools } from '~/modules/assistant/tools/apiTools';
import { agentCustomerToken } from '~/modules/customerAuth/customerSessions';
import { type Agent, answerText, madeAgentName } from './agent';
import { agentOrThrow, chatOf, modelKey, notifyRun } from './agents.service';
import { showTool, shownBlocks } from './blocks';

const GUIDE = `Use searchApi to find what you can do and callApi to do it. Your access is limited to what an admin allowed; when something is refused, say you can't do it and offer to hand the conversation to a person. Keep replies short and plain. Never make up prices, stock, dates or order details: read them from the API or your instructions. To show a product, a picture or a payment link, call show with what they gave you.`;

const CUSTOMER_GUIDE = `You are talking with one signed-in customer. Their own orders, bookings and profile are under the website and customer procedures (names with ":website:" or ":customer:"), which act as them. Never look up other customers' records.`;

/** The most entries one run reads back for what it showed. */
const RUN_ENTRIES_MAX = 200;

/** The key's caller now, or null once the key, its maker or the maker's role is gone. */
const keyCallerOf = async (client: Db, keyId: string) => {
  const [key] = await client.select().from(apiKeys).where(eq(apiKeys.id, keyId)).limit(1);
  const decided = key ? await keyCaller(client, key, null, { anyAddress: true }) : null;

  return decided && 'caller' in decided ? decided.caller : null;
};

/**
 * An agent an admin made. It calls the API by its key's rules, and when it serves customers and
 * the conversation is with one, also the plugins' website and customer routes as that customer.
 * A run's answer goes to the plugin that talks in the conversation as `core.agent.finished`.
 */
export const madeAgent = (id: string): Agent => ({
  name: madeAgentName(id),
  setup: (scope) =>
    withOrg(scope.orgId, async (tx) => {
      const row = await agentOrThrow(tx, id);
      const chat = await chatOf(tx, id, scope.key);
      const key = await modelKey(tx, row);
      const plugins = await installedPlugins(tx);
      const customerId = row.customers ? chat?.customerId : null;

      const tools = apiTools({
        caller: () => withOrg(scope.orgId, (client) => keyCallerOf(client, row.keyId)),
        orgId: scope.orgId,
        threadId: null,
        codeMode: false,
        plugins,
        ...(customerId
          ? {
              customer: {
                token: (plugin: string) =>
                  agentCustomerToken({ orgId: scope.orgId, customerId }, id, plugin),
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
            () => [row.instructions, GUIDE, ...(customerId ? [CUSTOMER_GUIDE] : [])].join('\n\n'),
            { tag: false },
          ),
        ],
        hooks: [
          hook(GenerationTask, {
            afterRun: async (run, api, context) => {
              if (chat) {
                const answer = answerText(await api.entry(run.answer, context));

                const { items } = await api.entries(
                  { minEntryId: run.first, maxEntryId: run.last, order: 'ascending' },
                  RUN_ENTRIES_MAX,
                  undefined,
                  context,
                );

                await notifyRun(scope.orgId, 'core.agent.finished', {
                  agentId: id,
                  plugin: chat.plugin,
                  key: scope.key,
                  answer,
                  blocks: shownBlocks(items),
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
