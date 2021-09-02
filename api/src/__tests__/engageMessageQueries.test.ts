import * as sinon from 'sinon';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  customerFactory,
  engageMessageFactory,
  tagsFactory,
  userFactory
} from '../db/factories';
import { Brands, EngageMessages, Segments, Tags, Users } from '../db/models';

import { EngagesAPI } from '../data/dataSources';
import './setup.ts';
import { set } from '../inmemoryStorage';

describe('engageQueries', () => {
  const qryEngageMessages = `
    query engageMessages(
      $kind: String
      $status: String
      $tag: String
      $ids: String
    ) {
      engageMessages(
        kind: $kind
        status: $status
        tag: $tag
        ids: $ids
      ) {
        _id
      }
    }
  `;

  const qryCount = `
    query engageMessageCounts($name: String! $kind: String $status: String) {
      engageMessageCounts(name: $name kind: $kind status: $status)
    }
  `;

  let dataSources;

  beforeEach(async () => {
    dataSources = { EngagesAPI: new EngagesAPI() };
  });

  afterEach(async () => {
    // Clearing test data
    await EngageMessages.deleteMany({});
    await Users.deleteMany({});
    await Tags.deleteMany({});
    await Brands.deleteMany({});
    await Segments.deleteMany({});
  });

  test('Engage messages', async () => {
    const user = await userFactory();

    await engageMessageFactory({});
    await engageMessageFactory({});
    await engageMessageFactory({ createdBy: user._id });

    const responses = await graphqlRequest(qryEngageMessages, 'engageMessages');

    expect(responses.length).toBe(3);
  });

  test('Engage messages filtered by ids', async () => {
    const engageMessage1 = await engageMessageFactory({});
    const engageMessage2 = await engageMessageFactory({});
    const engageMessage3 = await engageMessageFactory({});

    await engageMessageFactory({});

    const ids = `${engageMessage1._id},${engageMessage2._id},${engageMessage3._id}`;

    const responses = await graphqlRequest(
      qryEngageMessages,
      'engageMessages',
      { ids }
    );

    expect(responses.length).toBe(3);
  });

  test('Engage messages filtered by kind', async () => {
    await engageMessageFactory({ kind: 'manual' });
    await engageMessageFactory({ kind: 'manual' });
    await engageMessageFactory({ kind: 'manual' });

    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto' });

    let responses = await graphqlRequest(qryEngageMessages, 'engageMessages', {
      kind: 'manual'
    });

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(qryEngageMessages, 'engageMessages', {
      kind: 'auto'
    });

    expect(responses.length).toBe(2);
  });

  test('Engage messages filtered by status', async () => {
    const user = await userFactory({});

    await engageMessageFactory({ isLive: true });
    await engageMessageFactory({ isDraft: true });
    await engageMessageFactory({ isLive: false });
    await engageMessageFactory({ userId: user._id });

    // status live =======
    let response = await graphqlRequest(qryEngageMessages, 'engageMessages', {
      status: 'live'
    });

    expect(response.length).toBe(1);

    // status draft ======
    response = await graphqlRequest(qryEngageMessages, 'engageMessages', {
      status: 'draft'
    });

    expect(response.length).toBe(1);

    // status paused ======
    response = await graphqlRequest(qryEngageMessages, 'engageMessages', {
      status: 'paused'
    });

    expect(response.length).toBe(3);

    // status yours =======
    response = await graphqlRequest(
      qryEngageMessages,
      'engageMessages',
      { status: 'yours' },
      { user }
    );

    expect(response.length).toBe(1);
  });

  test('Engage messages filtered by tag', async () => {
    const tag = await tagsFactory();

    await engageMessageFactory();
    await engageMessageFactory();
    await engageMessageFactory({ tagIds: [tag._id] });
    await engageMessageFactory({ tagIds: [tag._id] });

    const response = await graphqlRequest(qryEngageMessages, 'engageMessages', {
      tag: tag._id
    });

    expect(response.length).toBe(2);
  });

  test('Engage email delivery report list', async () => {
    const customer = await customerFactory();
    const dataSourceMock = sinon
      .stub(dataSources.EngagesAPI, 'engageReportsList')
      .callsFake(() => {
        return Promise.resolve({
          list: [
            {
              _id: '123',
              status: 'pending'
            },
            {
              _id: '234',
              customerId: customer._id
            }
          ],
          totalCount: 2
        });
      });

    const query = `
      query engageReportsList($page: Int, $perPage: Int) {
        engageReportsList(page: $page, perPage: $perPage) {
          totalCount
          list {
            _id
            status
            createdAt
            customerId
            engage {
              title
            }
          }
        }
      }
    `;

    const response = await graphqlRequest(
      query,
      'engageReportsList',
      {},
      { dataSources }
    );

    expect(response.list.length).toBe(2);

    dataSourceMock.restore();
  });

  test('Engage message detail', async () => {
    const user = await userFactory();
    const engageMessage = await engageMessageFactory({ createdBy: user._id });

    const qry = `
      query engageMessageDetail($_id: String) {
        engageMessageDetail(_id: $_id) {
          _id
          kind
          segmentIds
          brandIds
          tagIds
          customerIds
          title
          fromUserId
          method
          isDraft
          isLive
          stopDate
          createdAt
          messengerReceivedCustomerIds

          email
          messenger
          createdBy
          createdUser

          brands { _id }
          segments { _id }
          brand { _id }
          customerTags { _id }
          fromUser { _id }
          getTags { _id }

          stats
          logs
          smsStats
        }
      }
    `;

    const response = await graphqlRequest(
      qry,
      'engageMessageDetail',
      { _id: engageMessage._id },
      { dataSources }
    );

    expect(response._id).toBe(engageMessage._id);
    expect(response.createdBy).toBe(user._id);

    const brand = await brandFactory();
    const messenger = { brandId: brand._id, content: 'Content' };
    const engageMessageWithBrand = await engageMessageFactory({
      messenger,
      brandIds: [brand._id],
      userId: user._id
    });

    set('erxes_brands', JSON.stringify(await Brands.find()));
    set('erxes_users', JSON.stringify(await Users.find()));

    const responseFromCache = await graphqlRequest(
      qry,
      'engageMessageDetail',
      { _id: engageMessageWithBrand._id },
      { dataSources }
    );

    expect(responseFromCache._id).toBe(engageMessageWithBrand._id);
    expect(responseFromCache.brand._id).toBe(brand._id);
    expect(responseFromCache.brands[0]._id).toBe(brand._id);
    expect(responseFromCache.fromUser._id).toBe(user._id);
  });

  test('Count engage messsage by kind', async () => {
    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto' });

    // default value of kind is 'manual' in engage message factory
    await engageMessageFactory({});
    await engageMessageFactory({});
    await engageMessageFactory({});

    const responses = await graphqlRequest(qryCount, 'engageMessageCounts', {
      name: 'kind'
    });

    expect(responses.all).toBe(5);
    expect(responses.auto).toBe(2);
    expect(responses.manual).toBe(3);
  });

  test('Count engage message by status', async () => {
    const user = await userFactory({});

    await engageMessageFactory({ kind: 'auto', isLive: true });
    await engageMessageFactory({ kind: 'auto', isDraft: true });

    // default value of kind is 'manual' in engage message factory
    await engageMessageFactory({ isLive: false });
    await engageMessageFactory({ userId: user._id });
    await engageMessageFactory({});

    let response = await graphqlRequest(qryCount, 'engageMessageCounts', {
      name: 'status',
      kind: 'auto'
    });

    expect(response.live).toBe(1);
    expect(response.draft).toBe(1);
    expect(response.paused).toBe(1);

    response = await graphqlRequest(
      qryCount,
      'engageMessageCounts',
      { name: 'status' },
      { user }
    );

    expect(response.paused).toBe(4);
    expect(response.yours).toBe(1);
  });

  test('Count engage message by tag', async () => {
    const tag = await tagsFactory();
    const user = await userFactory();

    // default value of isLive, isDraft are 'false'
    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({
      kind: 'auto',
      tagIds: [tag._id],
      isLive: true
    });
    await engageMessageFactory({
      kind: 'auto',
      tagIds: [tag._id],
      isDraft: true,
      isLive: true
    });
    await engageMessageFactory({ kind: 'auto', tagIds: [tag._id] });
    await engageMessageFactory({
      kind: 'auto',
      tagIds: [tag._id],
      userId: user._id
    });

    const args: any = { name: 'tag', kind: 'auto' };

    args.status = 'live';
    let response = await graphqlRequest(qryCount, 'engageMessageCounts', args);
    expect(response[tag._id]).toBe(2);

    args.status = 'draft';
    response = await graphqlRequest(qryCount, 'engageMessageCounts', args);
    expect(response[tag._id]).toBe(1);

    args.status = 'paused';
    response = await graphqlRequest(qryCount, 'engageMessageCounts', args);
    expect(response[tag._id]).toBe(2);

    args.status = 'yours';
    response = await graphqlRequest(qryCount, 'engageMessageCounts', args, {
      user
    });
    expect(response[tag._id]).toBe(1);

    args.kind = '';
    args.status = '';
    response = await graphqlRequest(qryCount, 'engageMessageCounts', args, {
      user
    });
    expect(response[tag._id]).toBe(4);
  });

  test('Get total count of engage message', async () => {
    await engageMessageFactory({});
    await engageMessageFactory({});
    await engageMessageFactory({});

    const qry = `
      query engageMessagesTotalCount {
        engageMessagesTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'engageMessagesTotalCount');

    expect(response).toBe(3);
  });

  test('Get verified emails', async () => {
    const qry = `
      query engageVerifiedEmails {
        engageVerifiedEmails
      }
    `;

    const mock = sinon
      .stub(dataSources.EngagesAPI, 'engagesGetVerifiedEmails')
      .callsFake(() => {
        return Promise.resolve([]);
      });

    await graphqlRequest(qry, 'engageVerifiedEmails', {}, { dataSources });

    mock.restore();
  });

  test('configDetail', async () => {
    const qry = `
      query engagesConfigDetail {
        engagesConfigDetail
      }
    `;

    try {
      await graphqlRequest(qry, 'engagesConfigDetail', {}, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Engages api is not running');
    }
  });

  test('Test getAverageStats()', async () => {
    const qry = `
      query engageEmailPercentages {
        engageEmailPercentages {
          avgBouncePercent
        }
      }
    `;

    const mock = sinon
      .stub(dataSources.EngagesAPI, 'getAverageStats')
      .callsFake(() => {
        return Promise.resolve({ data: { avgBouncePercent: 0 } });
      });

    await graphqlRequest(qry, 'engageEmailPercentages', {}, { dataSources });

    mock.restore();
  });
});
