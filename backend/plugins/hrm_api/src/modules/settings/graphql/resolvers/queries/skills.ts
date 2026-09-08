import { IContext } from '~/connectionResolvers';
import { SkillListParams, skillSelector } from '../../../db/models/Skills';
import { pager } from '../utils';

export const skillQueries = {
  async hrmSkillDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Skills.getSkill(_id);
  },

  async hrmSkillByCode(
    _root: undefined,
    { code }: { code: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Skills.getSkillByCode(code);
  },

  async hrmSkills(
    _root: undefined,
    params: SkillListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    const pagination = pager(params);

    return models.Skills.find(skillSelector(params))
      .sort({ category: 1, name: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
  },

  async hrmSkillsCount(
    _root: undefined,
    params: SkillListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('hrmSettingsView');
    return models.Skills.find(skillSelector(params)).countDocuments();
  },
};
