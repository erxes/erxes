import * as sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { integrationFactory } from '../../db/factories';
import { Integrations } from '../../db/models';
import { getPageList, receiveWebhookResponse } from '../../trackers/facebook';
import { graphRequest } from '../../trackers/facebookTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration common tests', () => {
  const pages = [{ id: '1', name: 'page1' }];

  afterEach(async () => {
    // clear
    await Integrations.remove({});
  });

  test('receive web hook response', async () => {
    const app = { id: 1 };

    await integrationFactory({
      kind: 'facebook',
      facebookData: { appId: app.id },
    });

    await receiveWebhookResponse(app, {});
  });

  test('get page list', async () => {
    const mock = sinon.stub(graphRequest, 'get').callsFake(() => ({ data: pages }));

    expect(await getPageList()).toEqual(pages);

    mock.restore(); // unwraps the spy
  });

  test('graph request', async () => {
    const mock = sinon.stub(graphRequest, 'base').callsFake(() => {
      '';
    });

    await graphRequest.get();
    await graphRequest.post();

    mock.restore(); // unwraps the spy
  });
});
