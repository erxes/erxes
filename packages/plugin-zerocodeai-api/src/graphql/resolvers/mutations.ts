import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const mutations = {
  /**
   * Send mail
   */
  async zerocodeaiSaveConfig(
    _root,
    args: any,
    { subdomain, models }: IContext
  ) {
    const prev = await models.Configs.findOne();

    if (!prev) {
      await models.Configs.create(args);
    } else {
      await models.Configs.update({}, { $set: args });
    }

    return models.Configs.findOne({});
  }
};

moduleRequireLogin(mutations);

export default mutations;
