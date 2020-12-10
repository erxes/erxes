import { Skills, SkillTypes } from '../../../db/models/Skills';
import { requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

const skillTypesQueries = {
  skillTypes(_root, args: { page?: number; perPage?: number }) {
    return paginate(SkillTypes.find({}), args).sort({ name: 1 });
  },

  skillTypesTotalCount() {
    return SkillTypes.countDocuments({});
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

requireLogin(skillTypesQueries, 'skillTypes');

export { skillTypesQueries, skillQueries };
