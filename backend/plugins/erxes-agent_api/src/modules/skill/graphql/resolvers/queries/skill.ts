import { IContext } from '~/connectionResolvers';

/** Queries over authored agent skills (procedural-memory playbooks). */
export const skillQueries = {
  mastraAgentSkills: async (
    _parent: undefined,
    { agentId }: { agentId?: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('agentSkillsView');
    return models.MastraAgentSkill.listSkills(agentId);
  },

  mastraAgentSkill: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('agentSkillsView');
    return models.MastraAgentSkill.getSkill(_id);
  },
};
