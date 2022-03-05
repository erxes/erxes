import { Accounts, Integrations } from "../../models";

const integrationQueries = {
  // app.get('/accounts', async (req, res) => {
  async integrationsGetAccounts(_root, { kind }:{ kind: string }) {
    if (kind.includes('nylas')) {
      kind = kind.split('-')[1];
    }
    const selector = { kind };

    // debugResponse(debugIntegrations, req, JSON.stringify(accounts));

    return Accounts.find(selector);
  },
  
  // app.get('/integrations', async (req, res) => {
  async integrationsGetIntegrations(_root, { kind }:{ kind: string }) {
    const integrations = await Integrations.find({ kind });

    // debugResponse(debugIntegrations, req, JSON.stringify(integrations));

    return integrations;
  },

  //  app.get('/integrationDetail', async (req, res) => {
  async integrationsGetIntegrationDetail(_root, { erxesApiId }:{ erxesApiId: string } ) {
    // do not expose fields below
    const integration = await Integrations.findOne(
      { erxesApiId },
      {
        nylasToken: 0,
        nylasAccountId: 0,
        nylasBillingState: 0,
        googleAccessToken: 0
      }
    );

    // debugResponse(debugIntegrations, req, JSON.stringify(integration));

    return integration;
  }

  
};

export default integrationQueries;
