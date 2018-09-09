import * as faker from 'faker';
import { TAG_TYPES } from '../data/constants';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { brandFactory, channelFactory, integrationFactory, tagsFactory } from '../db/factories';
import { Brands, Channels, Integrations } from '../db/models';
import { socUtils } from '../trackers/twitterTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('integrationQueries', () => {
  const qryIntegrations = `
    query integrations(
      $page: Int
      $perPage: Int
      $kind: String
      $searchValue: String
      $channelId: String
      $brandId: String
      $tag: String
    ) {
      integrations(
        page: $page
        perPage: $perPage
        kind: $kind
        searchValue: $searchValue
        channelId: $channelId
        brandId: $brandId
        tag: $tag
      ) {
        _id
        kind
        name
        brandId
        languageCode
        code
        formId
        formData
        messengerData
        twitterData
        facebookData
        uiOptions

        brand { _id }
        form { _id }
        channels { _id }
      }
    }
  `;

  const qryCount = `
    query integrationsTotalCount {
      integrationsTotalCount {
        total
        byTag
        byKind
        byBrand
        byChannel
      }
    }
  `;

  const name = faker && faker.random ? faker.random.word() : 'anonymous';

  afterEach(async () => {
    // Clearing test data
    await Integrations.remove({});
    await Channels.remove({});
    await Brands.remove({});
  });

  test('Integrations', async () => {
    await integrationFactory({});
    await integrationFactory({});
    await integrationFactory({});
    await integrationFactory({});

    const responses = await graphqlRequest(qryIntegrations, 'integrations', {
      page: 1,
      perPage: 3,
    });

    expect(responses.length).toBe(3);
  });

  test('Integrations filtered by tag', async () => {
    await integrationFactory({});
    await integrationFactory({});
    await integrationFactory({});

    const tagObj = await tagsFactory({ type: TAG_TYPES.INTEGRATION });
    await integrationFactory({ tagIds: [tagObj._id] });

    const responses = await graphqlRequest(qryIntegrations, 'integrations', {
      page: 1,
      perPage: 20,
      tag: tagObj._id,
    });

    expect(responses.length).toBe(1);
  });

  test('Integrations filtered by kind', async () => {
    await integrationFactory({ kind: 'messenger' });
    await integrationFactory({ kind: 'form' });
    await integrationFactory({ kind: 'twitter' });
    await integrationFactory({ kind: 'facebook' });

    // messenger ========================
    let responses = await graphqlRequest(qryIntegrations, 'integrations', {
      kind: 'messenger',
    });

    expect(responses.length).toBe(1);

    // facebook =====================
    responses = await graphqlRequest(qryIntegrations, 'integrations', {
      kind: 'facebook',
    });

    expect(responses.length).toBe(1);

    // twitter ======================
    responses = await graphqlRequest(qryIntegrations, 'integrations', {
      kind: 'twitter',
    });

    expect(responses.length).toBe(1);

    // form =========================
    responses = await graphqlRequest(qryIntegrations, 'integrations', {
      kind: 'form',
    });

    expect(responses.length).toBe(1);
  });

  test('Integrations filtered by channel', async () => {
    const integration1 = await integrationFactory({ kind: 'twitter' });
    const integration2 = await integrationFactory({ kind: 'twitter' });

    await integrationFactory({ kind: 'twitter' });

    const integrationIds = [integration1._id, integration2._id];

    const channel = await channelFactory({ integrationIds });

    const responses = await graphqlRequest(qryIntegrations, 'integrations', {
      channelId: channel._id,
    });

    expect(responses.length).toBe(2);
  });

  test('Integrations filtered by brand', async () => {
    const brand = await brandFactory();

    await integrationFactory({ kind: 'messenger', brandId: brand._id });
    await integrationFactory({ kind: 'form', brandId: brand._id });
    await integrationFactory({ kind: 'form' });

    const responses = await graphqlRequest(qryIntegrations, 'integrations', {
      brandId: brand._id,
    });

    expect(responses.length).toBe(2);
  });

  test('Integrations filtered by search value', async () => {
    // default value of kind is 'messenger' in factory
    await integrationFactory({ name });
    await integrationFactory({});

    const responses = await graphqlRequest(qryIntegrations, 'integrations', {
      searchValue: name,
    });

    expect(responses.length).toBe(1);
  });

  test('Integration detail', async () => {
    const integration = await integrationFactory();

    const qry = `
      query integrationDetail($_id: String!) {
        integrationDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'integrationDetail', {
      _id: integration._id,
    });

    expect(response._id).toBe(integration._id);
  });

  test('Get total count of integrations by kind', async () => {
    await integrationFactory({ kind: 'messenger' });
    await integrationFactory({ kind: 'form' });
    await integrationFactory({ kind: 'twitter' });
    await integrationFactory({ kind: 'facebook' });

    // messenger =========================
    let response = await graphqlRequest(qryCount, 'integrationsTotalCount', {});

    expect(response.byKind.messenger).toBe(1);

    // form =============================
    response = await graphqlRequest(qryCount, 'integrationsTotalCount', {});

    expect(response.byKind.form).toBe(1);

    // facebook ==========================
    response = await graphqlRequest(qryCount, 'integrationsTotalCount', {});

    expect(response.byKind.twitter).toBe(1);

    // twitter ===========================
    response = await graphqlRequest(qryCount, 'integrationsTotalCount', {});

    expect(response.byKind.facebook).toBe(1);
  });

  test('Get total count of integrations by channel', async () => {
    const integration1 = await integrationFactory({});
    const integration2 = await integrationFactory({});

    await integrationFactory({});

    const integrationIds = [integration1._id, integration2._id];

    const channel = await channelFactory({ integrationIds });

    const response = await graphqlRequest(qryCount, 'integrationsTotalCount', {});

    expect(response.byChannel[channel._id]).toBe(2);
  });

  test('Get total count of integrations by brand', async () => {
    const brand = await brandFactory();

    await integrationFactory({ kind: 'messenger', brandId: brand._id });
    await integrationFactory({ kind: 'form', brandId: brand._id });
    await integrationFactory({ kind: 'form' });

    const response = await graphqlRequest(qryCount, 'integrationsTotalCount', {});

    expect(response.byBrand[brand._id]).toBe(2);
  });

  test('Integration get twitter auth url', async () => {
    socUtils.getTwitterAuthorizeUrl = jest.fn();

    const qry = `
      query integrationGetTwitterAuthUrl {
        integrationGetTwitterAuthUrl
      }
    `;

    await graphqlRequest(qry, 'integrationGetTwitterAuthUrl');
  });

  test('Integration get facebook apps list', async () => {
    process.env.FACEBOOK = JSON.stringify([
      {
        id: 'id',
        name: 'name',
        accessToken: 'access_token',
      },
    ]);

    const qry = `
      query integrationFacebookAppsList {
        integrationFacebookAppsList
      }
    `;

    const [response] = await graphqlRequest(qry, 'integrationFacebookAppsList');

    expect(response.id).toBe('id');
    expect(response.name).toBe('name');
  });
});
