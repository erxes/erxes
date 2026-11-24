import { defineExtension, GenerationTask, hook, section } from '@earendil-works/pi-durable';
import { AgentHandedOff } from '@erxes/core-contract';
import { apiKeys, customers, type Db, portalPlugins, portals, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { keyCaller } from '~/modules/apiKeys/keyCaller';
import { apiTools } from '~/modules/apiTools/agentTools';
import { installedPlugins } from '~/modules/apiTools/plugins';
import { modelKey } from '~/modules/assistant/connections.service';
import { modelsFor } from '~/modules/assistant/providers';
import { agentCustomerToken } from '~/modules/customerAuth/customerSessions';
import { agentPortalToken } from '~/modules/portals/portalKeys';
import { type Agent, type AgentScope, madeAgentName } from './agent';
import { agentOrThrow, chatOf, notifyRun } from './agents.service';
import { runEntries, showTool, shownBlocks } from './blocks';
import { failureGuard, handOffOf, handOffTool, replyOf } from './runs';

const GUIDE = `Use searchApi to find what you can do and callApi to do it. Keep replies short and plain, in the customer's language. Never make up prices, stock, dates or order details: read them from the API or your instructions. Money from the API is in its currency's smallest unit, as erxes keeps it: divide by 100 before you show it, so 150000 MNT is ₮1,500 and 134000 USD is $1,340. To show a product, a picture or a payment link, call show with what they gave you.

Never tell the customer about permissions, access, errors or how you work. When a call is refused or fails and no other call does the job, don't try it again: call handOff with the reason for the team and one short line telling the customer, in their language, that a person will reply. Do the same when the customer asks for a person.`;

/** Read each turn, so a booking agent turns "next Friday" into a date. */
const todayLine = (now: Date) =>
  `Today is ${now.toISOString().slice(0, 10)} (UTC). Work out dates such as "next Friday" from it, and read them back with the year.`;

const GUEST_GUIDE = `You talk with a visitor of the portal. Its routes (names with ":portal:") work for anyone: products, carts and checkout. A visitor who hasn't signed in has no orders of their own to see.`;

const CUSTOMER_GUIDE = `You are talking with one customer of the portal. Their own orders, bookings and profile are under the portal and customer procedures (names with ":portal:" or ":customer:"), which act as them. Never look up other customers' records. Use the name, phone and email below for orders and ask only for what is missing. Confirm the phone before checkout: delivery depends on it.`;

const known = (value: string | null) => value?.trim() || 'not known';

/** Who the customer is, as core keeps them: their name, phone and email, nothing more. */
const customerLine = async (client: Db, id: string) => {
  const [customer] = await client
    .select({
      firstName: customers.firstName,
      lastName: customers.lastName,
      primaryPhone: customers.primaryPhone,
      primaryEmail: customers.primaryEmail,
    })
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!customer) return null;

  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');

  return `The customer is ${known(name)}. Phone: ${known(customer.primaryPhone)}. Email: ${known(customer.primaryEmail)}.`;
};

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
 * The portal's routes for the agent: a guest's with the portal's token alone, and when the
 * conversation is with a customer, theirs too, with their token.
 */
const portalAccess = (
  scope: AgentScope,
  agentId: string,
  portal: { id: string; plugins: string[] },
  customerId: string | null,
) => {
  const who = { orgId: scope.orgId, portalId: portal.id };

  return {
    plugins: portal.plugins,
    signedIn: customerId !== null,
    credentials: async () => ({
      'x-portal-token': await agentPortalToken(scope.orgId, portal.id, agentId),
      ...(customerId
        ? { authorization: `Bearer ${await agentCustomerToken({ ...who, customerId }, agentId)}` }
        : {}),
    }),
  };
};

/**
 * An agent an admin made. It calls the API by its key's rules, and with a portal also the
 * portal's guest routes, and its customer's own when the conversation is with one. A run's
 * answer goes to the plugin that talks in the conversation as `core.agent.finished`, then
 * `core.agent.handed_off` when it gave the conversation to a person.
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

      const portal = await portalOf(tx, row.portalId);
      const customerId = portal ? (chat?.customerId ?? null) : null;
      const customer = customerId ? await customerLine(tx, customerId) : null;

      const tools = apiTools({
        caller: () => withOrg(scope.orgId, (client) => keyCallerOf(client, row.keyId)),
        orgId: scope.orgId,
        unattended: true,
        plugins: await installedPlugins(tx),
        ...(portal ? { portal: portalAccess(scope, id, portal, customerId) } : {}),
      });

      const instructions = [
        row.instructions,
        GUIDE,
        todayLine(new Date()),
        ...(portal && !customerId ? [GUEST_GUIDE] : []),
        ...(customerId ? [CUSTOMER_GUIDE, customer ?? ''] : []),
      ];

      const extension = defineExtension({
        name: 'made-agent',
        tools: [...tools, showTool, handOffTool],
        sections: [section('agent', () => instructions.join('\n\n'), { tag: false })],
        hooks: [
          failureGuard,
          hook(GenerationTask, {
            afterRun: async (run, api) => {
              if (!chat) return undefined;

              const entries = await runEntries(api, run.first, run.last);
              const to = { agentId: id, plugin: chat.plugin, key: scope.key };

              await notifyRun(scope.orgId, 'core.agent.finished', {
                ...to,
                answer: replyOf(entries, run.answer),
                blocks: shownBlocks(entries),
              });

              const handOff = handOffOf(entries);

              if (handOff) {
                const payload = AgentHandedOff.parse({ ...to, reason: handOff.reason });

                await notifyRun(scope.orgId, 'core.agent.handed_off', payload);
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
