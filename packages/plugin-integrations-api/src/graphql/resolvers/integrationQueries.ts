import { IContext } from '../../connectionResolver';

const integrationQueries = {
  // app.get('/accounts', async (req, res) => {
  async integrationsGetAccounts(
    _root,
    { kind }: { kind: string },
    { models }: IContext
  ) {
    const selector = { kind };

    return models.Accounts.find(selector);
  },

  // app.get('/integrations', async (req, res) => {
  async integrationsGetIntegrations(
    _root,
    { kind }: { kind: string },
    { models }: IContext
  ) {
    return models.Integrations.find({ kind });
  },

  //  app.get('/integrationDetail', async (req, res) => {
  async integrationsGetIntegrationDetail(
    _root,
    { erxesApiId }: { erxesApiId: string },
    { models }: IContext
  ) {
    // do not expose fields below
    const integration = await models.Integrations.findOne(
      { erxesApiId },
      {
        nylasToken: 0,
        nylasAccountId: 0,
        nylasBillingState: 0,
        googleAccessToken: 0
      }
    );

    return integration;
  },

  // app.get('/configs', async (req, res) => {
  async integrationsGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  }
};

export default integrationQueries;
