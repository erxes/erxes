/* eslint-env jest */

import { connect, disconnect } from '../../db/connection';
import { receiveWebhookResponse } from '../../social/facebook';
import { Integrations } from '../../db/models';
import { integrationFactory } from '../../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration common tests', () => {
  afterEach(async () => {
    // clear
    await Integrations.remove({});
  });

  it('receive web hook response', async () => {
    const app = { id: 1 };

    await integrationFactory({ kind: 'facebook', facebookData: { appId: app.id } });

    await receiveWebhookResponse(app, {});
  });
});
