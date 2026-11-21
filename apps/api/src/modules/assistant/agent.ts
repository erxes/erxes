import { defineExtension, section } from '@earendil-works/pi-durable';
import { assistantThreads, enterScope, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { memberOf } from '~/http/auth';
import type { Agent, AgentScope } from '~/modules/agents/agent';
import { ASSISTANT_AGENT } from './chat.service';
import { listConnections, openKey } from './connections.service';
import { instructionsFor } from './instructions';
import { installedPlugins } from './plugins';
import { modelsFor } from './providers';
import { getSettings } from './settings.service';
import { loadSkill, skillsFor } from './skills/skills';
import { apiTools, type ToolScope } from './tools/apiTools';
import { askUser } from './tools/askUser';
import { createArtifact } from './tools/createArtifact';
import { runCode } from './tools/runCode';

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

/** The in-product assistant: one conversation per thread, acting as the thread's member. */
export const assistantAgent: Agent = {
  name: ASSISTANT_AGENT,
  setup: async (scope) => {
    const member = await threadOwner(scope);

    return enterScope(member, scope.orgId, () =>
      withOrg(scope.orgId, async (tx) => {
        const { codeMode } = await getSettings(tx);
        const plugins = await installedPlugins(tx);
        const { data } = await listConnections(tx);
        const skills = skillsFor(plugins);

        const tools: ToolScope = {
          member,
          orgId: scope.orgId,
          threadId: scope.key,
          codeMode,
          plugins,
        };

        const keys = data.flatMap(({ provider, secret }) => {
          const apiKey = openKey(secret);

          return apiKey === null ? [] : [{ provider, apiKey }];
        });

        const extension = defineExtension({
          name: 'assistant',
          tools: [
            ...apiTools(tools),
            askUser,
            createArtifact,
            loadSkill(skills),
            ...(codeMode ? [runCode(tools)] : []),
          ],
          sections: [
            section('erxes', () => instructionsFor(new Date(), skills, codeMode), { tag: false }),
          ],
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
