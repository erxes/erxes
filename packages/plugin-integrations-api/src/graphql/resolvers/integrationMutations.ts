import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateIntegrationConfigs } from '../../helpers';

const integrationMutations = {
  async integrationsUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateIntegrationConfigs(models, configsMap);

    return { status: 'ok' };
  }
};

export default integrationMutations;
