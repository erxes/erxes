import { requireLogin } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const skillTypesQueries = {
  skillTypes(_root, _params, { models }: IContext) {
    return models.SkillTypes.find({}).sort({ name: 1 });
  },

  skillTypesTotalCount(_root, _params, { models }: IContext) {
    return models.SkillTypes.countDocuments({});
  }
};

const getSkillSelector = (typeId: string, memberIds?: string[]) => {
  const selector: any = {};

  if (typeId) {
    selector.typeId = typeId;
  }

  if (memberIds) {
    selector.memberIds = { $nin: memberIds };
  }

  return selector;
};

const skillQueries = {
  async skill(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Skills.findOne({ _id });
  },

  async skills(
    _root,
    {
      typeId,
      memberIds,
      list = false,
      ...args
    }: {
      typeId: string;
      memberIds: string[];
      page?: number;
      perPage?: number;
      list?: boolean;
    },
    { models }: IContext
  ) {
    if (!list && memberIds) {
      return models.Skills.find({ memberIds: { $in: memberIds } });
    }

    if (list && memberIds) {
      return models.Skills.find(getSkillSelector(typeId, memberIds));
    }

    return paginate(models.Skills.find(getSkillSelector(typeId)), args);
  },

  async skillsTotalCount(_root, { typeId }: { typeId: string }, { models }: IContext) {
    return models.Skills.countDocuments(getSkillSelector(typeId));
  }
};

requireLogin(skillTypesQueries, 'skillTypes');

export { skillTypesQueries, skillQueries };