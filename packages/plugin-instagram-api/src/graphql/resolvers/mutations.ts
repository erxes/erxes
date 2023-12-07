import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateConfigs } from '../../helpers';

const instagramMutations = {
  async instagramUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },

  async instagramRepair(_root, { _id }: { _id: string }, { models }: IContext) {
    await repairIntegrations(models, _id);

    return 'success';
  }
};

export default instagramMutations;
