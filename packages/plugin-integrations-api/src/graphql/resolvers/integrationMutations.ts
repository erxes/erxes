// import { updateIntegrationConfigs } from "../../helpers";

const integrationMutations = {
  integrationsAdd() {
    console.log('adding............................')
    return {}
  },
  async integrationsUpdateConfigs(_root, { configsMap }) {
    console.log('-----------------------------integration configs uptading...', configsMap)

    // routeErrorHandling(async (req, res) => {
      // await updateIntegrationConfigs(configsMap);
  
      // debugResponse(debugIntegrations, req);
  
      return {status: 'ok'}
    // })
  }
}

export default integrationMutations;