import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const skillTypesMutations = {
  async createSkillType(_root, { name }: { name: string }, { models }: IContext) {
    return models.SkillTypes.createSkillType(name);
  },

  async updateSkillType(_root, { _id, name }: { _id; name: string }, { models }: IContext) {
    return models.SkillTypes.updateSkillType(_id, name);
  },

  async removeSkillType(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.SkillTypes.removeSkillType(_id);
  }
};

const skillsMutations = {
  async createSkill(
    _root,
    doc: { name: string; typeId: string; memberIds: string[] },
    { models }: IContext
  ) {
    return models.Skills.createSkill(doc);
  },

  async updateSkill(
    _root,
    doc: { _id: string; name: string; typeId: string; memberIds: string[] },
    { models }: IContext
  ) {
    return models.Skills.updateSkill(doc);
  },

  async addUserSkills(
    _root,
    { memberId, skillIds }: { memberId: string; skillIds: string[] },
    { models }: IContext
  ) {
    return models.Skills.updateMany(
      { _id: { $in: skillIds } },
      { $push: { memberIds: memberId } }
    );
  },

  async excludeUserSkill(
    _root,
    { _id, memberIds }: { _id: string; memberIds: string[] },
    { models }: IContext
  ) {
    return models.Skills.excludeUserSkill(_id, memberIds);
  },

  async removeSkill(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Skills.removeSkill(_id);
  }
};

checkPermission(skillTypesMutations, 'createSkillType', 'createSkillType');
checkPermission(skillTypesMutations, 'updateSkillType', 'updateSkillType');
checkPermission(skillTypesMutations, 'removeSkillType', 'removeSkillType');

checkPermission(skillsMutations, 'createSkill', 'createSkill');
checkPermission(skillsMutations, 'updateSkill', 'updateSkill');
checkPermission(skillsMutations, 'removeSkill', 'removeSkill');

export { skillTypesMutations, skillsMutations };