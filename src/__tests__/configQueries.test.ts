import { graphqlRequest } from '../db/connection';
import { configFactory } from '../db/factories';

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
          widgetVersion {
            packageVersion
          }
        }
      }
    `;

    const config = await graphqlRequest(qry, 'configsVersions');

    expect(config.erxesVersion.packageVersion).toBe(null);
    expect(config.apiVersion.packageVersion).toBe(null);
    expect(config.widgetVersion.packageVersion).toBe(null);
  });
});
