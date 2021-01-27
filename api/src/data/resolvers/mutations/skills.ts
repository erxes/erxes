import { Skills, SkillTypes } from '../../../db/models';
import { checkPermission } from '../../permissions/wrappers';

const skillTypesMutations = {
  async createSkillType(_root, { name }: { name: string }) {
    return SkillTypes.createSkillType(name);
  },

  async updateSkillType(_root, { _id, name }: { _id; name: string }) {
    return SkillTypes.updateSkillType(_id, name);
  },

  async removeSkillType(_root, { _id }: { _id: string }) {
    return SkillTypes.removeSkillType(_id);
  }
};

const skillsMutations = {
  async createSkill(
    _root,
    doc: { name: string; typeId: string; memberIds: string[] }
  ) {
    return Skills.createSkill(doc);
  },

  async updateSkill(
    _root,
    doc: { _id: string; name: string; typeId: string; memberIds: string[] }
  ) {
    return Skills.updateSkill(doc);
  },

  async addUserSkills(
    _root,
    { memberId, skillIds }: { memberId: string; skillIds: string[] }
  ) {
    return Skills.updateMany(
      { _id: { $in: skillIds } },
      { $push: { memberIds: memberId } }
    );
  },

  async excludeUserSkill(
    _root,
    { _id, memberIds }: { _id: string; memberIds: string[] }
  ) {
    return Skills.excludeUserSkill(_id, memberIds);
  },

  async removeSkill(_root, { _id }: { _id: string }) {
    return Skills.removeSkill(_id);
  }
};

checkPermission(skillTypesMutations, 'createSkillType', 'manageSkillTypes');
checkPermission(skillTypesMutations, 'updateSkillType', 'manageSkillTypes');
checkPermission(skillTypesMutations, 'removeSkillType', 'manageSkillTypes');

checkPermission(skillsMutations, 'createSkill', 'manageSkills');
checkPermission(skillsMutations, 'updateSkill', 'manageSkills');
checkPermission(skillsMutations, 'removeSkill', 'manageSkills');

export { skillTypesMutations, skillsMutations };
