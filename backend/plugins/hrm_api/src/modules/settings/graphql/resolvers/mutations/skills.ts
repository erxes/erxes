import { IContext } from '~/connectionResolvers';
import { SkillInput } from '../../../db/models/Skills';
import { validateSkillInput } from '../validators';

export const skillMutations = {
  async hrmSkillsCreate(
    _root: undefined,
    { doc }: { doc: SkillInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Skills.createSkill(validateSkillInput(doc));
  },

  async hrmSkillsUpdate(
    _root: undefined,
    { _id, doc }: { _id: string; doc: SkillInput },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Skills.updateSkill(_id, validateSkillInput(doc));
  },

  async hrmSkillsArchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsManage');
    return models.Skills.archiveSkill(_id);
  },

  async hrmSkillsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsRemove');
    return models.Skills.removeSkill(_id);
  },
};
