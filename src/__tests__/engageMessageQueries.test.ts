import { connect, disconnect, graphqlRequest } from '../db/connection';
import { engageMessageFactory, tagsFactory, userFactory } from '../db/factories';
import { EngageMessages, Tags, Users } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('engageQueries', () => {
  const qryEngageMessages = `
    query engageMessages(
      $kind: String
      $status: String
      $tag: String
      $ids: [String]
    ) {
      engageMessages(
        kind: $kind
        status: $status
        tag: $tag
        ids: $ids
      ) {
        _id
        kind
        segmentId
        customerIds
        title
        fromUserId
        method
        isDraft
        isLive
        stopDate
        createdDate
        messengerReceivedCustomerIds
        tagIds

        email
        messenger
        deliveryReports

        segment { _id }
        fromUser { _id }
        getTags { _id }
      }
    }
  `;

  const qryCount = `
    query engageMessageCounts($name: String! $kind: String $status: String) {
      engageMessageCounts(name: $name kind: $kind status: $status)
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await EngageMessages.remove({});
    await Users.remove({});
    await Tags.remove({});
  });

  test('Engage messages filtered by ids', async () => {
    const engageMessage1 = await engageMessageFactory({});
    const engageMessage2 = await engageMessageFactory({});
    const engageMessage3 = await engageMessageFactory({});

    await engageMessageFactory({});

    const ids = [engageMessage1._id, engageMessage2._id, engageMessage3._id];

    const responses = await graphqlRequest(qryEngageMessages, 'engageMessages', { ids });

    expect(responses.length).toBe(3);
  });

  test('Engage messages filtered by kind', async () => {
    await engageMessageFactory({ kind: 'manual' });
    await engageMessageFactory({ kind: 'manual' });
    await engageMessageFactory({ kind: 'manual' });

    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto' });

    let responses = await graphqlRequest(qryEngageMessages, 'engageMessages', { kind: 'manual' });

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(qryEngageMessages, 'engageMessages', { kind: 'auto' });

    expect(responses.length).toBe(2);
  });

  test('Engage messages filtered by status', async () => {
    const user = await userFactory({});

    await engageMessageFactory({ isLive: true });
    await engageMessageFactory({ isDraft: true });
    await engageMessageFactory({ isLive: false });
    await engageMessageFactory({ userId: user._id });

    // status live =======
    let response = await graphqlRequest(qryEngageMessages, 'engageMessages', { status: 'live' });

    expect(response.length).toBe(1);

    // status draft ======
    response = await graphqlRequest(qryEngageMessages, 'engageMessages', { status: 'draft' });

    expect(response.length).toBe(1);

    // status paused ======
    response = await graphqlRequest(qryEngageMessages, 'engageMessages', { status: 'paused' });

    expect(response.length).toBe(3);

    // status yours =======
    response = await graphqlRequest(qryEngageMessages, 'engageMessages', { status: 'yours' }, { user });

    expect(response.length).toBe(1);
  });

  test('Engage messages filtered by tag', async () => {
    const tag = await tagsFactory();

    await engageMessageFactory();
    await engageMessageFactory();
    await engageMessageFactory({ tagIds: [tag._id] });
    await engageMessageFactory({ tagIds: [tag._id] });

    const response = await graphqlRequest(qryEngageMessages, 'engageMessages', { tag: tag._id });

    expect(response.length).toBe(2);
  });

  test('Engage message detail', async () => {
    const engageMessage = await engageMessageFactory();

    const qry = `
      query engageMessageDetail($_id: String) {
        engageMessageDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'engageMessageDetail', { _id: engageMessage._id });

    expect(response._id).toBe(engageMessage._id);
  });

  test('Count engage messsage by kind', async () => {
    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto' });

    // default value of kind is 'manual' in engage message factory
    await engageMessageFactory({});
    await engageMessageFactory({});
    await engageMessageFactory({});

    const responses = await graphqlRequest(qryCount, 'engageMessageCounts', { name: 'kind' });

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
      kind: 'auto',
    });

    expect(response.live).toBe(1);
    expect(response.draft).toBe(1);
    expect(response.paused).toBe(1);

    response = await graphqlRequest(qryCount, 'engageMessageCounts', { name: 'status', kind: 'manual' }, { user });

    expect(response.paused).toBe(3);
    expect(response.yours).toBe(1);
  });

  test('Count engage message by tag', async () => {
    const tag = await tagsFactory();

    // default value of isLive, isDraft are 'false'
    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto' });
    await engageMessageFactory({ kind: 'auto', tagIds: [tag._id] });
    await engageMessageFactory({ kind: 'auto', tagIds: [tag._id] });

    let response = await graphqlRequest(qryCount, 'engageMessageCounts', {
      name: 'tag',
      kind: 'auto',
    });

    expect(response[tag._id]).toBe(2);

    response = await graphqlRequest(qryCount, 'engageMessageCounts', {
      name: 'tag',
      kind: 'manual',
    });

    expect(response[tag._id]).toBe(0);
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
});
