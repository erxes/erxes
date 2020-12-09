import { Skills, SkillTypes } from '../../../db/models/Skills';
import { requireLogin } from '../../permissions/wrappers';

const skillTypesQueries = {
  getSkillTypes() {
    return SkillTypes.getSkilltypes();
  }
};

const skillQueries = {
  async getSkill(_root, { _id }: { _id: string }) {
    return Skills.getSkill(_id);
  },

  async getSkills(_root, { typeId }: { typeId: string }) {
    return Skills.getSkills(typeId);
  }
};

requireLogin(skillTypesQueries, 'getSkillTypes');

export { skillTypesQueries, skillQueries };
