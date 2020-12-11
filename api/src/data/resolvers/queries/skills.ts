import { Skills, SkillTypes } from '../../../db/models/Skills';
import { requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

const skillTypesQueries = {
  skillTypes() {
    return SkillTypes.find({}).sort({ name: 1 });
  },

  skillTypesTotalCount() {
    return SkillTypes.countDocuments({});
  }
};

const getSkillSelector = typeId => {
  const selector: { [key: string]: string } = {};

  if (typeId) {
    selector.typeId = typeId;
  }

  return selector;
};

const skillQueries = {
  async skill(_root, { _id }: { _id: string }) {
    const skill = await Skills.findOne({ _id });

    if (!skill) {
      throw new Error('Skill not found');
    }

    return skill;
  },

  async skills(
    _root,
    {
      typeId,
      memberIds,
      ...args
    }: { typeId: string; memberIds: string[]; page?: number; perPage?: number }
  ) {
    if (memberIds) {
      return Skills.find({ memberIds: { $in: memberIds } });
    }

    return paginate(Skills.find(getSkillSelector(typeId)), args);
  },

  async skillsTotalCount(_root, { typeId }: { typeId: string }) {
    return Skills.countDocuments(getSkillSelector(typeId));
  }
};

requireLogin(skillTypesQueries, 'skillTypes');

export { skillTypesQueries, skillQueries };
