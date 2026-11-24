import {
  defineExtension,
  type GenerationHooks,
  GenerationTask,
  hook,
  section,
} from '@earendil-works/pi-durable';
import { assistantThreads, enterScope, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { memberOf } from '~/http/auth';
import type { Agent, AgentScope } from '~/modules/agents/agent';
import { apiTools, runCode } from '~/modules/apiTools/agentTools';
import type { ToolScope } from '~/modules/apiTools/calls';
import { installedPlugins } from '~/modules/apiTools/plugins';
import { ASSISTANT_AGENT, MEMBER_ENTRY } from './chat.service';
import { connectedProviders } from './connectedProviders';
import { instructionsFor } from './instructions';
import { modelsFor } from './providers';
import { referencesIn } from './references.service';
import { getSettings } from './settings.service';
import { loadSkill, skillsFor } from './skills/skills';
import { createArtifact } from './tools/createArtifact';
import { uiProblem } from './ui';

/** The member whose thread this is; the assistant acts as them. */
const threadOwner = async ({ orgId, key }: AgentScope) => {
  const [thread] = await withOrg(orgId, (tx) =>
    tx
      .select({ userId: assistantThreads.userId })
      .from(assistantThreads)
      .where(eq(assistantThreads.id, key))
      .limit(1),
  );

  if (!thread) throw notFound('Thread');

  const member = await memberOf(orgId, thread.userId);

  if (!member) throw fail('UNAUTHORIZED', 'The member who started this chat is no longer active');

  return member;
};

const UI_CHECK = '[UI check]';

type OnYield = GenerationHooks['onYield'];

const askedForFix = async (api: Parameters<OnYield>[1], context: Parameters<OnYield>[2]) => {
  const { items } = await api.entries({}, 20, undefined, context);
  const asked = items.findIndex(({ kind }) => kind === MEMBER_ENTRY);
  const turn = asked < 0 ? items : items.slice(0, asked);

  return turn.some(({ model }) =>
    model?.some(
      (message) => message.role === 'user' && JSON.stringify(message.content).includes(UI_CHECK),
    ),
  );
};

const fixInterface: OnYield = async (answer, api, context) => {
  const reply = answer.content
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('');

  const problem = uiProblem(reply);

  if (!problem || (await askedForFix(api, context))) return undefined;

  return {
    continue: `${UI_CHECK} The panel could not draw an interface block in your last reply: ${problem} Reply with only the corrected <a2ui> block and no other text; the member already has the rest of the reply.`,
  };
};

/** The in-product assistant: one conversation per thread, acting as the thread's member. */
export const assistantAgent: Agent = {
  name: ASSISTANT_AGENT,
  setup: async (scope) => {
    const member = await threadOwner(scope);

    return enterScope(member, scope.orgId, () =>
      withOrg(scope.orgId, async (tx) => {
        const { codeMode } = await getSettings(tx);
        const plugins = await installedPlugins(tx);
        const connected = await connectedProviders(tx);
        const skills = skillsFor(plugins);

        const tools: ToolScope = {
          caller: () => memberOf(scope.orgId, member.userId),
          orgId: scope.orgId,
          unattended: true,
          plugins,
          references: referencesIn(scope.orgId, scope.key),
        };

        const keys = connected.flatMap(({ key }) => (key ? [key] : []));

        const extension = defineExtension({
          name: 'assistant',
          tools: [
            ...apiTools(tools),
            createArtifact,
            loadSkill(skills),
            ...(codeMode ? [runCode(tools)] : []),
          ],
          sections: [
            section('erxes', () => instructionsFor(new Date(), skills, codeMode), { tag: false }),
          ],
          hooks: [hook(GenerationTask, { onYield: fixInterface })],
        });

        return {
          models: modelsFor(keys),
          extensions: [extension],
          agent: { extensions: [extension] },
        };
      }),
    );
  },
};
