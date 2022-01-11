import { paginate, requireLogin } from "@erxes/api-utils";
import { Skills, SkillTypes } from "../../models";

const skillTypesQueries = {
  skillTypes() {
    return SkillTypes.find({}).sort({ name: 1 });
  },

  skillTypesTotalCount() {
    return SkillTypes.countDocuments({});
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
  async skill(_root, { _id }: { _id: string }) {
    return Skills.findOne({ _id });
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
    }
  ) {
    if (!list && memberIds) {
      return Skills.find({ memberIds: { $in: memberIds } });
    }

    if (list && memberIds) {
      return Skills.find(getSkillSelector(typeId, memberIds));
    }

    return paginate(Skills.find(getSkillSelector(typeId)), args);
  },

  async skillsTotalCount(_root, { typeId }: { typeId: string }) {
    return Skills.countDocuments(getSkillSelector(typeId));
  }
};

requireLogin(skillTypesQueries, 'skillTypes');

export { skillTypesQueries, skillQueries };
