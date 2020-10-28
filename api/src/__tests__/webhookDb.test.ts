import { webhookFactory } from '../db/factories';
import { Webhooks } from '../db/models';

import './setup.ts';

describe('Test webhooks model', () => {
  let _webhook;
  let _webhook2;

  beforeEach(async () => {
    // Creating test data
    _webhook = await webhookFactory({});

    _webhook2 = await webhookFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Webhooks.deleteMany({});
  });

  test('Get webhook', async () => {
    try {
      await Webhooks.getWebHook('fakeId');
    } catch (e) {
      expect(e.message).toBe('Webhook not found');
    }

    const response = await Webhooks.getWebHook(_webhook._id);

    expect(response).toBeDefined();
  });

  test('Get webhooks', async () => {
    const response = await Webhooks.getWebHooks();

    expect(response.length).toEqual(2);
  });

  test('Create webhook check valid url', async () => {
    expect.assertions(1);
    try {
      await Webhooks.createWebhook({
        token: _webhook.token,
        url: 'http://alskdjalksjd.com',
        actions: []
      });
    } catch (e) {
      expect(e.message).toEqual(
        'Url is not valid. Enter valid url with ssl cerfiticate'
      );
    }
  });

  test('Update webhook check valid url', async () => {
    expect.assertions(1);
    try {
      await Webhooks.updateWebhook(_webhook2._id, {
        url: 'http://alskdjalksjd.com',
        token: _webhook.token,
        actions: _webhook.actions
      });
    } catch (e) {
      expect(e.message).toEqual(
        'Url is not valid. Enter valid url with ssl cerfiticate'
      );
    }
  });

  test('Create Webhook', async () => {
    const webhookObj = await Webhooks.createWebhook({
      url: 'https://test.com',
      actions: _webhook.actions
    });

    expect(webhookObj.url).toEqual('https://test.com');
    expect(webhookObj.actions.length).toBeGreaterThan(0);
    expect(webhookObj.token).toBeDefined();
  });

  test('Update Webhook', async () => {
    const webhookObj = await Webhooks.updateWebhook(_webhook._id, {
      url: 'https://test.com',
      actions: _webhook.actions
    });

    expect(webhookObj).toBeDefined();
    expect(webhookObj.url).toEqual('https://test.com');
    expect(webhookObj.actions.length).toBeGreaterThan(0);
  });

  test('Remove Webhook', async () => {
    const isDeleted = await Webhooks.removeWebhooks(_webhook.id);

    expect(isDeleted).toBeTruthy();
  });

  test('Update webhook status', async () => {
    const response = await Webhooks.updateStatus(_webhook2._id, 'available');

    expect(response.status).toEqual('available');
  });
});
