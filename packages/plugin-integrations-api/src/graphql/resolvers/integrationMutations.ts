import { repairIntegrations, updateIntegrationConfigs } from '../../helpers';

const integrationMutations = {
  async integrationsUpdateConfigs(_root, { configsMap }) {
    await updateIntegrationConfigs(configsMap);

    return { status: 'ok' };
  },
  async integrationsRepair(_root, { _id }: { _id: string }) {
    await repairIntegrations(_id)

    return 'success';
  },
};

export default integrationMutations;
