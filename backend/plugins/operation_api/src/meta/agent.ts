import { IAgentPluginMeta } from 'erxes-api-shared/core-modules';
import { TASKS_SKILL } from './agentSkills';

/** What operation contributes to the core AI assistant. */
export const agent: IAgentPluginMeta = {
  skills: [
    {
      name: 'tasks',
      description:
        "Tasks (overdue, assigned to me, created by me, in a project, a person's work since a date), project reports, teams and members, cycles, triage, task activity, and creating or updating tasks, projects or teams.",
      instructions: TASKS_SKILL,
    },
  ],
};
