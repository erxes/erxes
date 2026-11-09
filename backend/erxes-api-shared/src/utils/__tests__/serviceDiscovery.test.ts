jest.mock('../redis', () => ({ redis: {} }));
jest.mock('../saas', () => ({}));
jest.mock('../mq-worker', () => ({}));

import {
  getGraphqlPlugins,
  getNoGraphqlPlugins,
  getPlugins,
} from '../service-discovery';

describe('plugins without GraphQL', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
  });

  afterAll(() => {
    process.env = env;
  });

  it('keeps every enabled plugin in getPlugins', async () => {
    process.env.ENABLED_PLUGINS = 'sales,hr';
    process.env.ENABLED_PLUGINS_NO_GRAPHQL = 'hr';

    expect(await getPlugins()).toEqual(['core', 'sales', 'hr']);
  });

  it('leaves no-GraphQL plugins out of the supergraph list', async () => {
    process.env.ENABLED_PLUGINS = 'sales,hr,operation';
    process.env.ENABLED_PLUGINS_ONLY_API = 'reports';
    process.env.ENABLED_PLUGINS_NO_GRAPHQL = ' hr , reports ';

    expect(await getGraphqlPlugins()).toEqual(['core', 'sales', 'operation']);
  });

  it('never drops core', async () => {
    process.env.ENABLED_PLUGINS = 'hr';
    process.env.ENABLED_PLUGINS_NO_GRAPHQL = 'core,hr,';

    expect(getNoGraphqlPlugins()).toEqual(['hr']);
    expect(await getGraphqlPlugins()).toEqual(['core']);
  });

  it('changes nothing when the variable is unset', async () => {
    process.env.ENABLED_PLUGINS = 'sales,hr';
    delete process.env.ENABLED_PLUGINS_NO_GRAPHQL;

    expect(await getGraphqlPlugins()).toEqual(['core', 'sales', 'hr']);
  });
});
