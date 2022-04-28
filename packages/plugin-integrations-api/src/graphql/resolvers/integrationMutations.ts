import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateIntegrationConfigs } from '../../helpers';

const integrationMutations = {
  async integrationsUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateIntegrationConfigs(models, configsMap);

    return { status: 'ok' };
  },
  async integrationsRepair(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    await repairIntegrations(models, _id);

    return 'success';
  }
};

export default integrationMutations;
