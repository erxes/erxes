import {
  DEFAULT_CONSTANT_VALUES,
  USER_ROLES
} from '@erxes/api-utils/src/constants';
import { IContext } from '../../connectionResolver';
import { IUserDocument } from '../../db/models/definitions/users';
import { getUserActionsMap } from '../permissions/utils';
import { getConfigs } from '../utils';
import { getDocumentList } from './mutations/cacheUtils';

export default {
  __resolveReference: ({ _id }, { models }: IContext) => {
    return models.Users.findOne({ _id });
  },

  status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Not verified';
    }

    return 'Verified';
  },

  brands(user: IUserDocument, _args, { models }: IContext) {
    if (user.isOwner) {
      return getDocumentList(models, 'brands', {});
    }

    return getDocumentList(models, 'brands', { _id: { $in: user.brandIds } });
  },

  async permissionActions(user: IUserDocument, _args, { models }: IContext) {
    return getUserActionsMap(models, user);
  },

  async configs(_user, _args, { models }: IContext) {
    return getConfigs(models);
  },

  async configsConstants(_user, _args, { models }: IContext) {
    const results: any[] = [];
    const configs = await getConfigs(models);
    const constants = models.Configs.constants();

    for (const key of Object.keys(constants)) {
      const configValues = configs[key] || [];
      const constant = constants[key];

      let values = constant.filter(c => configValues.includes(c.value));

      if (!values || values.length === 0) {
        values = DEFAULT_CONSTANT_VALUES[key];
      }

      results.push({
        key,
        values
      });
    }

    return results;
  },

  async onboardingHistory(user: IUserDocument, _args, { models }: IContext) {
    const entries = await models.OnboardingHistories.find({
      userId: user._id
    });
    const completed = entries.find(item => item.isCompleted);

    /**
     * When multiple entries are recorded, using findOne() gave wrong result.
     * Therefore return the first completed one if exists
     */
    if (completed) {
      return completed;
    }

    return entries[0];
  },

  department(user: IUserDocument, _args, { models }: IContext) {
    return models.Departments.findOne({ userIds: { $in: user._id } });
  },

  async leaderBoardPosition(user: IUserDocument, _args, { models }: IContext) {
    return (
      (await models.Users.find({
        score: { $gt: user.score || 0 },
        role: { $ne: USER_ROLES.SYSTEM }
      }).count()) + 1
    );
  }
};
