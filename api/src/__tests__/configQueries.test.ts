import { graphqlRequest } from '../db/connection';

import * as sinon from 'sinon';
import * as utils from '../data/utils';
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

  test('configsStatus', async () => {
    const qry = `
      query configsStatus {
        configsStatus {
          erxesApi {
            os {
              type
            }
          }
          erxesIntegration {
            os {
              type
            }
          }
        }
      }
    `;

    let config = await graphqlRequest(qry, 'configsStatus');

    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve({ packageVersion: '-' });
    });

    config = await graphqlRequest(qry, 'configsStatus');

    mock.restore();
  });

  test('configsConstants', async () => {
    const qry = `
      query configsConstants {
        configsConstants
      }
    `;

    await graphqlRequest(qry, 'configsConstants');
  });

  test('Check activate installation', async () => {
    const qry = `
      query configsCheckActivateInstallation($hostname: String!) {
        configsCheckActivateInstallation(hostname: $hostname)
      }
    `;

    try {
      await graphqlRequest(qry, 'configsCheckActivateInstallation', {
        hostname: 'localhost'
      });
    } catch (e) {
      expect(e[0].message).toBe('');
    }

    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('ok');
    });

    const response = await graphqlRequest(
      qry,
      'configsCheckActivateInstallation',
      {
        hostname: 'localhost'
      }
    );

    expect(response).toBe('ok');

    mock.restore();
  });
});
