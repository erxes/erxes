import { graphqlRequest } from '../db/connection';
import { configFactory } from '../db/factories';

import { EngagesAPI } from '../data/dataSources';
import './setup.ts';

describe('configQueries', () => {
  test('config detail', async () => {
    const config = await configFactory();

    const args = { code: config.code };

    const qry = `
      query configsDetail($code: String!) {
        configsDetail(code: $code) {
          _id
          code
          value
        }
      }
    `;

    const response = await graphqlRequest(qry, 'configsDetail', args);

    expect(response.code).toBe(config.code);
  });

  test('config get env', async () => {
    process.env.USE_BRAND_RESTRICTIONS = 'true';

    const qry = `
      query configsGetEnv {
        configsGetEnv {
          USE_BRAND_RESTRICTIONS
        }
      }
    `;

    const response = await graphqlRequest(qry, 'configsGetEnv');

    expect(response.USE_BRAND_RESTRICTIONS).toBe('true');
  });

  test('config get env', async () => {
    process.env.MAIN_APP_DOMAIN = 'http://fake.erxes.io';
    process.env.DOMAIN = 'http://fake.erxes.io';
    process.env.WIDGETS_API_DOMAIN = 'http://fake.erxes.io';
    process.env.WIDGETS_DOMAIN = 'http://fake.erxes.io';

    process.env.NODE_ENV = 'dev';

    const qry = `
      query configsVersions {
        configsVersions {
          erxesVersion {
            packageVersion
          }
          apiVersion {
            packageVersion
          }
          widgetApiVersion {
            packageVersion
          }
          widgetVersion {
            packageVersion
          }
        }
      }
    `;

    const config = await graphqlRequest(qry, 'configsVersions');

    expect(config.erxesVersion.packageVersion).toBe(null);
    expect(config.apiVersion.packageVersion).toBe(null);
    expect(config.widgetApiVersion.packageVersion).toBe(null);
    expect(config.widgetVersion.packageVersion).toBe(null);
  });

  test('config get env', async () => {
    process.env.ENGAGES_API_DOMAIN = 'http://fake.erxes.io';

    const qry = `
      query engagesConfigDetail {
        engagesConfigDetail {
          accessKeyId
        }
      }
    `;

    const dataSources = { EngagesAPI: new EngagesAPI() };

    try {
      await graphqlRequest(qry, 'engagesConfigDetail', {}, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Engages api is not running');
    }
  });
});
