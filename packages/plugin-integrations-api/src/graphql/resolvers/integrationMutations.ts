import { updateIntegrationConfigs } from '../../helpers';

const integrationMutations = {
  async integrationsUpdateConfigs(_root, { configsMap }) {
    await updateIntegrationConfigs(configsMap);

    return { status: 'ok' };
  }
};

export default integrationMutations;
