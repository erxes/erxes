import * as faker from 'faker';
import * as request from 'supertest';

import {
  customerFactory,
  integrationFactory,
  scriptFactory,
  userFactory
} from '../db/factories';
import { Customers, Integrations, Scripts, Users } from '../db/models';
import { app } from '../index';
import './setup.ts';

/**
 * Run this test when erxes-api is stopped, because while erxes-api is running, it throws port being used error.
 */
describe('HTTP endpoint tests', () => {
  afterEach(async () => {
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Scripts.deleteMany({});
    await Users.deleteMany({});
  });

  test('Test /initial-setup endpoint with no users', async () => {
    const response = await request(app).get('/initial-setup');

    expect(response.text).toBe('no owner');
  });

  test('Test /initial-setup endpoint with users', async () => {
    await userFactory();

    const response = await request(app).get('/initial-setup');

    expect(response.text).toBe('[]');
  });

  test('Test /health', async () => {
    const response = await request(app).get('/health');

    expect(response.text).toBe('ok');
  });

  test('Test /script-manager without script id', async () => {
    const response = await request(app).get('/script-manager');

    expect(response.text).toBe('Not found');
  });

  test('Test /script-manager with script id', async () => {
    const script = await scriptFactory({ name: 'script' });
    const response = await request(app)
      .get('/script-manager')
      .query({ id: script._id });

    expect(response.text).toContain('window.erxesSettings');
  });

  test('Test /events-identify-customer', async () => {
    const integration = await integrationFactory();
    const customer = await customerFactory({
      integrationId: integration._id,
      primaryEmail: faker.internet.email(),
      primaryPhone: faker.phone.phoneNumber()
    });

    const response = await request(app)
      .post('/events-identify-customer')
      .send({
        args: {
          email: customer.primaryEmail,
          phone: customer.primaryPhone,
          code: customer.code
        }
      });

    expect(response.body).toBeDefined();
    expect(response.body.customerId).toBe(customer._id);
  });

  test('Test /telnyx/webhook', async () => {
    const webhookParams = {
      from: faker.phone.phoneNumber(),
      to: faker.phone.phoneNumber(),
      telnyxId: faker.random.uuid()
    };

    const webhookData = {
      data: {
        payload: {
          from: webhookParams.from || faker.phone.phoneNumber(),
          id: webhookParams.telnyxId || faker.random.uuid(),
          to: [
            {
              phone_number: webhookParams.to || faker.phone.phoneNumber(),
              status: faker.random.word()
            }
          ]
        }
      }
    };

    const response = await request(app)
      .post('/telnyx/webhook')
      .send(webhookData);

    expect(response).toBeDefined();
  });
});
