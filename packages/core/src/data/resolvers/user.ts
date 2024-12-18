import moment = require('moment');

import {
  DEFAULT_CONSTANT_VALUES,
  USER_ROLES,
} from '@erxes/api-utils/src/constants';
import {
  coreModelExperiences,
  getOrganizationDetail,
  coreModelBundles,
  getPlugin,
} from '@erxes/api-utils/src/saas/saas';
import { getConfigs, getEnv } from '../utils';

import { IContext } from '../../connectionResolver';
import { IUserDocument } from '../../db/models/definitions/users';
import { calcUsage } from '@erxes/api-utils/src/saas/chargeUtils';
import { getRelatedOrganizations } from '../../organizations';
import { getUserActionsMap } from '@erxes/api-utils/src';

export default {
  __resolveReference: async ({ _id }, { models }: IContext) => {
    const user = await models.Users.findOne({ _id });

    if (!user) {
      return null;
    }

    return user;
  },

  async status(user: IUserDocument) {
    if (user.registrationToken) {
      return 'Not verified';
    }

    return 'Verified';
  },

  async currentOrganization(_user, _args, { subdomain, models }: IContext) {
    const organization = await getOrganizationDetail({ subdomain, models });

    let isPaid = false;

    const { promoCodes, plan, expiryDate, charge = {} } = organization;
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (NODE_ENV !== 'production') {
      const result = {
        ...organization,
        contactRemaining: 10000,
        isPaid: true,
      };

      return result;
    }

    const contactPlugin =
      (await getPlugin({
        type: 'contacts',
      })) || {};

    // const orgPromoCodes = await getOrgPromoCodes(organization);

    contactPlugin.usage = await calcUsage({
      subdomain,
      pluginType: contactPlugin.type,
      organization,
      // orgPromoCodes,
    });

    const remainingAmount = contactPlugin.usage.remainingAmount;

    const experience = await coreModelExperiences.findOne({
      _id: organization.experienceId,
    });
    const bundle = await coreModelBundles.findOne({
      _id: organization?.bundleId,
    });

    let contactRemaining = remainingAmount <= 0 ? false : true;

    if (bundle) {
      const bundlLimit = bundle?.pluginLimits
        ? (bundle?.pluginLimits || {})[contactPlugin.type] || 0
        : 0;
      contactRemaining = bundlLimit > 0 ? true : contactRemaining;
    }

    if (experience) {
      organization.experience = experience;
      const expContactLimit = experience.pluginLimits
        ? experience.pluginLimits[contactPlugin.type] || 0
        : 0;

      contactRemaining = expContactLimit === 0 ? true : contactRemaining;
    }

    if (promoCodes && promoCodes.length > 0) {
      isPaid = true;
    } else if (
      plan === 'growth' &&
      expiryDate &&
      moment(expiryDate).isAfter(new Date())
    ) {
      isPaid = true;
    } else {
      for (const [key] of Object.entries(charge)) {
        const chargeItem = charge[key];
        if (
          chargeItem.subscriptionId &&
          moment(chargeItem.expiryDate).isAfter(new Date())
        ) {
          isPaid = true;

          break;
        }
      }
    }

    const result = {
      ...organization,
      contactRemaining,
      isPaid,
    };

    return result;
  },

  async organizations(_user, _args, { subdomain, models }) {
    const organization = await getOrganizationDetail({ subdomain, models });

    const orgs = await getRelatedOrganizations(organization.ownerId);

    return orgs;
  },

  async brands(user: IUserDocument, _args, { models }: IContext) {
    if (user.isOwner) {
      return models.Brands.find().lean();
    }

    return models.Brands.find({
      _id: { $in: user.brandIds },
    }).lean();
  },

  async permissionActions(
    user: IUserDocument,
    _args,
    { subdomain, models: { Permissions } }: IContext
  ) {
    return getUserActionsMap(subdomain, user, query => Permissions.find(query));
  },

  async configs(_user, _args, { models }: IContext) {
    return getConfigs(models);
  },

  async configsConstants(_user, _args, { models }: IContext) {
    const results: any[] = [];
    const configs = await getConfigs(models);
    const constants = await models.Configs.constants();

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

  async onboardingHistory(user: IUserDocument, _args, { models }: IContext) {
    const entries = await models.OnboardingHistories.find({
      userId: user._id,
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

  async departments(user: IUserDocument, _args, { models }: IContext) {
    return models.Departments.find({ _id: { $in: user.departmentIds } });
  },

  async branches(user: IUserDocument, _args, { models }: IContext) {
    return models.Branches.find({ _id: { $in: user.branchIds } });
  },

  async positions(user: IUserDocument, _args, { models }: IContext) {
    return models.Positions.find({ _id: { $in: user.positionIds } });
  },

  async leaderBoardPosition(user: IUserDocument, _args, { models }: IContext) {
    return (
      (await models.Users.find({
        score: { $gt: user.score || 0 },
        role: { $ne: USER_ROLES.SYSTEM },
      }).countDocuments()) + 1
    );
  },
};
