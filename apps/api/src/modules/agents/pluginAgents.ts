import {
  defineExtension,
  defineTool,
  type EntryRecord,
  GenerationTask,
  hook,
  section,
} from '@earendil-works/pi-durable';
import { type Db, withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { notFound } from '~/http/errors';
import { signJwt } from '~/lib/signing';
import { installedPlugins } from '~/modules/assistant/plugins';
import { modelsFor } from '~/modules/assistant/providers';
import { pluginProcedures } from '~/modules/assistant/tools/pluginDocument';
import { callPluginRoute } from '~/modules/assistant/tools/pluginOperations';
import { publishCoreEvents } from '~/modules/events/events.service';
import type { Agent, AgentScope } from './agent';
import { agentModelKey } from './agentModels';

const AGENT_CALL_TYP = 'erxes-agent-call+jwt';

const Args = z.record(z.string(), z.unknown());

/** The installed plugin that declares `name` (`frontline.bot`), and the declaration; 404 when there is none. */
export const pluginAgentDefinition = async (client: Db, name: string) => {
  const [plugin = '', agent] = name.split('.');
  const installed = (await installedPlugins(client)).find((row) => row.name === plugin);
  const definition = installed?.agents.find((row) => row.name === agent);

  if (!installed || !definition) throw notFound('Agent');

  return { installed, definition };
};

/** A 5-minute token for the plugin's API: core, running this conversation of its agent. */
const agentCallToken = (plugin: string, name: string, scope: AgentScope) =>
  signJwt(
    { org: scope.orgId, agent: name, key: scope.key },
    { typ: AGENT_CALL_TYP, audience: plugin, subject: `agent:${name}`, expiresInSeconds: 300 },
  );

/** What the model said in an answer entry, its text parts joined. */
export const answerText = (entry: EntryRecord | undefined) =>
  (entry?.model ?? [])
    .flatMap((message) => (message.role === 'assistant' ? message.content : []))
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n')
    .trim();

/**
 * An agent a plugin declares in its manifest (`agents`), named `<plugin>.<name>`. It runs as the
 * plugin, never as a member: its tools are the plugin's own procedures, called with an agent call
 * token. When a run answers, `core.agent.finished` carries the answer to the plugin.
 */
export const pluginAgent = (name: string): Agent => ({
  name,
  setup: (scope) =>
    withOrg(scope.orgId, async (tx) => {
      const { installed, definition } = await pluginAgentDefinition(tx, name);
      const plugin = installed.name;
      const key = await agentModelKey(tx, name);
      const operationOf = (route: { name: string }) => route.name.slice(plugin.length + 1);

      const routes = (await pluginProcedures([installed])).filter(
        (route) => !route.denied && definition.tools.includes(operationOf(route)),
      );

      const tools = routes.map((route) =>
        defineTool({
          name: operationOf(route).replaceAll(/[^\w-]/g, '_'),
          description: [route.summary, route.description].filter(Boolean).join('. '),
          parameters: route.input,
          execute: async (args) => {
            const result = await callPluginRoute(route, Args.parse(args), () =>
              agentCallToken(plugin, name, scope),
            );

            return { output: [{ type: 'text', text: JSON.stringify(result) }] };
          },
        }),
      );

      const extension = defineExtension({
        name: 'plugin-agent',
        tools,
        sections: [section('plugin-agent', () => definition.instructions, { tag: false })],
        hooks: [
          hook(GenerationTask, {
            afterRun: async (run, api, context) => {
              const answer = answerText(await api.entry(run.answer, context));

              await withOrg(scope.orgId, (client) =>
                publishCoreEvents(client, {
                  type: 'core.agent.finished',
                  payload: { agent: name, key: scope.key, answer },
                }),
              );

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

export const isPluginAgent = (name: string) => name.includes('.');
