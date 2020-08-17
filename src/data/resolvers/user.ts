import { Brands, Configs, OnboardingHistories } from '../../db/models';
import { DEFAULT_CONSTANT_VALUES } from '../../db/models/definitions/constants';
import { IUserDocument } from '../../db/models/definitions/users';
import { getUserActionsMap } from '../permissions/utils';
import { getConfigs } from '../utils';

export default {
  status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Not verified';
    }

    return 'Verified';
  },

  brands(user: IUserDocument) {
    if (user.isOwner) {
      return Brands.find({});
    }

    return Brands.find({ _id: { $in: user.brandIds } });
  },

  async permissionActions(user: IUserDocument) {
    return getUserActionsMap(user);
  },

  async configs() {
    return getConfigs();
  },

  async configsConstants() {
    const results: any[] = [];
    const configs = await getConfigs();
    const constants = Configs.constants();

    for (const key of Object.keys(constants)) {
      const configValues = configs[key] || [];
      const constant = constants[key];

      let values = constant.filter(c => configValues.includes(c.value));

      if (!values || values.length === 0) {
        values = DEFAULT_CONSTANT_VALUES[key];
      }

      results.push({
        key,
        values,
      });
    }

    return results;
  },

  async onboardingHistory(user: IUserDocument) {
    const entries = await OnboardingHistories.find({ userId: user._id });
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
};
