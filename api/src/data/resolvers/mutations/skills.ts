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
    doc: { _id: string; name: string; memberIds: string[] }
  ) {
    return Skills.updateSkill(doc);
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
