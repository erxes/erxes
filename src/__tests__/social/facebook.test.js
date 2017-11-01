/* eslint-env jest */

import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { graphRequest, getPageList, receiveWebhookResponse } from '../../social/facebook';
import { Integrations } from '../../db/models';
import { integrationFactory } from '../../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration common tests', () => {
  const pages = [{ id: '1', name: 'page1' }];

  beforeEach(() => {
    // mock all requests
    sinon.stub(graphRequest, 'get').callsFake(() => ({ data: pages }));
  });

  afterEach(async () => {
    // clear
    await Integrations.remove({});
    graphRequest.get.restore(); // unwraps the spy
  });

  it('receive web hook response', async () => {
    const app = { id: 1 };

    await integrationFactory({ kind: 'facebook', facebookData: { appId: app.id } });

    await receiveWebhookResponse(app, {});
  });

  it('get page list', async () => {
    expect(getPageList()).toEqual(pages);
  });
});
