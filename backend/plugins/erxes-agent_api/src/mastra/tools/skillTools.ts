import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import type { IModels } from '~/connectionResolvers';

// Level 2 of progressive disclosure (the Anthropic Agent Skills pattern): the
// agent always sees the lean skill INDEX in its system prompt (name +
// description); when a task matches one, it calls load_skill to pull the full
// playbook into context and follow it. The body is fetched live from Mongo on
// every call, so an edited playbook takes effect immediately — and the lookup
// is scoped to THIS agent, so one agent can never read another's private skill.
export function buildSkillTools(params: {
  models: IModels;
  agentId: string;
  // The names visible to this agent — surfaced back to the model on a miss so a
  // mistyped name self-corrects without a dead end.
  availableNames: string[];
}) {
  const { models, agentId, availableNames } = params;

  const loadSkill = createTool({
    id: 'load_skill',
    description:
      'Load the full step-by-step instructions for one of your skills (named ' +
      'playbooks listed under "Skills" in your instructions). BEFORE doing a ' +
      'task that matches a skill, call this with its EXACT name, then follow the ' +
      'returned instructions precisely — they are verified and take priority ' +
      'over improvising.',
    inputSchema: z.object({
      name: z
        .string()
        .describe('Exact skill name from your Skills list, e.g. "refund-order".'),
    }),
    outputSchema: z.any(),
    execute: async ({ name }) => {
      const skill = await models.MastraAgentSkill.findForAgentByName(
        agentId,
        name,
      );
      if (!skill) {
        return {
          found: false,
          error: `No skill named "${name}" is available to you.`,
          available: availableNames,
        };
      }
      // Best-effort usage telemetry; never blocks the load.
      void models.MastraAgentSkill.recordSkillUse(skill._id);
      return {
        found: true,
        name: skill.name,
        title: skill.title,
        instructions: skill.body,
      };
    },
  });

  return { load_skill: loadSkill };
}
