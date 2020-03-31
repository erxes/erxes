import { graphqlRequest } from '../db/connection';

import { configFactory } from '../db/factories';
import './setup.ts';

describe('configQueries', () => {
  test('configs', async () => {
    await configFactory({});

    const qry = `
      query configs {
        configs {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'configs');

    expect(response.length).toBe(1);
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
