import { getCoreDomain } from 'erxes-api-shared/utils';

import * as dotenv from 'dotenv';
import { IContext } from '~/connectionResolvers';
import fetch from 'node-fetch';

dotenv.config();

export const organizationConfigQueries = {
  /**
   * Config object
   */
  async configs(_parent: undefined, _args: undefined, { models }: IContext) {
    return models.Configs.find({});
  },

  async configsByCode(
    _parent: undefined,
    { codes, pattern }: { codes: string[]; pattern: string },
    { models }: IContext,
  ) {
    const query: any = {
      $or: [],
    };

    if (codes?.length) {
      query.$or.push({ code: { $in: codes } });
    }

    if (pattern) {
      query.$or.push({ code: { $regex: pattern, $options: 'i' } });
    }

    return models.Configs.find(query);
  },

  async configsGetEnv() {
    return {
      USE_BRAND_RESTRICTIONS: process.env.USE_BRAND_RESTRICTIONS,
      RELEASE: process.env.RELEASE,
    };
  },

  async configsCheckActivateInstallation(
    _parent: undefined,
    args: { hostname: string },
  ) {
    try {
      return await fetch(`${getCoreDomain()}/check-activate-installation`, {
        method: 'POST',
        body: JSON.stringify(args),
        headers: { 'Content-Type': 'application/json' },
      }).then((r) => r.json());
    } catch (e: any) {
      throw new Error(e.message);
    }
  },

  async configsGetValue(
    _parent: undefined,
    { code }: { code: string },
    { models }: IContext,
  ) {
    return models.Configs.findOne({ code });
  },
};
