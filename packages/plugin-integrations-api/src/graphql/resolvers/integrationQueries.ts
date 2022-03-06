import { Accounts, Configs, Integrations } from "../../models";

const integrationQueries = {
  // app.get('/accounts', async (req, res) => {
  async integrationsGetAccounts(_root, { kind }:{ kind: string }) {
    console.log('------------------------get accounts query working...')
    if (kind.includes('nylas')) {
      kind = kind.split('-')[1];
    }
    const selector = { kind };

    // debugResponse(debugIntegrations, req, JSON.stringify(accounts));

    return Accounts.find(selector);
  },
  
  // app.get('/integrations', async (req, res) => {
  async integrationsGetIntegrations(_root, { kind }:{ kind: string }) {
    console.log('------------------------get integrations query working...')
    const integrations = await Integrations.find({ kind });

    // debugResponse(debugIntegrations, req, JSON.stringify(integrations));

    return integrations;
  },

  //  app.get('/integrationDetail', async (req, res) => {
  async integrationsGetIntegrationDetail(_root, { erxesApiId }:{ erxesApiId: string } ) {
    // do not expose fields below
    console.log('get integration detail query working...')
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
  },

  // app.get('/gmail/get-email',
  async integrationsGetGmailEmail(_root, { accountId }:{ accountId: string } ) {
    console.log('------------------------get gmail query working...')
    // routeErrorHandling(async (req, res) => {
      const account = await Accounts.findOne({ _id: accountId });

      if (!account) {
        throw new Error('Account not found');
      }

      return account.email;
    // })
  },

  // app.get('/configs', async (req, res) => {
  async integrationsGetConfigs(_root, {}) {
    console.log('-------------------------configs query working...')
    const configs = await Configs.find({});

    // debugResponse(debugIntegrations, req, JSON.stringify(configs));

    return configs;
  }

  
};

export default integrationQueries;
