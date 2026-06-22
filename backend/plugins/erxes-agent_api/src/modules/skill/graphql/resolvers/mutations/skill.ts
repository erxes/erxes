import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IMastraAgentSkill } from '@/skill/@types/skill';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
const requireUserId = (user: IUserDocument | null | undefined): string => {
  const userId = user?._id;
  if (!userId) throw new ExpectedError('Login required');
  return userId;
};

/** Mutations for authored agent skills (the "teach the agent" surface). */
export const skillMutations = {
  mastraAgentSkillAdd: async (
    _parent: undefined,
    { doc }: { doc: IMastraAgentSkill },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentSkillsCreate');
    const userId = requireUserId(user);
    return models.MastraAgentSkill.createSkill(doc, userId);
  },

  mastraAgentSkillEdit: async (
    _parent: undefined,
    { _id, doc }: { _id: string; doc: Partial<IMastraAgentSkill> },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentSkillsEdit');
    requireUserId(user);
    return models.MastraAgentSkill.updateSkill(_id, doc);
  },

  mastraAgentSkillRemove: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('agentSkillsRemove');
    requireUserId(user);
    return models.MastraAgentSkill.removeSkill(_id);
  },
};
