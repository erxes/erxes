import { EngagesAPI, IntegrationsAPI } from '../data/dataSources';
import { graphqlRequest } from '../db/connection';
import './setup.ts';

describe('Sms delivery query', () => {
  test('Test smsDeliveries()', async () => {
    const query = `
      query smsDeliveries($type: String!, $to: String, $page: Int, $perPage: Int) {
        smsDeliveries(type: $type, to: $to, page: $page, perPage: $perPage) {
          list {
            _id
          }
          totalCount
        }
      }
    `;

    const dataSources = {
      EngagesAPI: new EngagesAPI(),
      IntegrationsAPI: new IntegrationsAPI()
    };

    const mockEngages = jest.spyOn(dataSources.EngagesAPI, 'getSmsDeliveries');
    const mockIntegrations = jest.spyOn(
      dataSources.IntegrationsAPI,
      'getSmsDeliveries'
    );

    mockEngages.mockImplementation(() =>
      Promise.resolve({ data: [], status: 'ok' })
    );
    mockIntegrations.mockImplementation(() =>
      Promise.resolve({ status: 'error', error: 'Error occurred' })
    );

    let response;

    try {
      response = await graphqlRequest(
        query,
        'smsDeliveries',
        { type: '' },
        { dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('SMS delivery type must be chosen');
    }

    // fetch from engages-email-sender
    response = await graphqlRequest(
      query,
      'smsDeliveries',
      { type: 'campaign' },
      { dataSources }
    );

    expect(response.list).toHaveLength(0);

    try {
      // fetch from integrations
      response = await graphqlRequest(
        query,
        'smsDeliveries',
        { type: 'integration' },
        { dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('Error occurred');
    }

    mockEngages.mockRestore();
    mockIntegrations.mockRestore();
  });
});
