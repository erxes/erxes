import {
  brandFactory,
  customerFactory,
  engageMessageFactory,
  segmentFactory,
  tagsFactory,
  userFactory,
} from '../db/factories';
import { Brands, Customers, EngageMessages, Segments, Tags, Users } from '../db/models';

import './setup.ts';

describe('engage messages model tests', () => {
  let _user;
  let _segment;
  let _brand;
  let _tag;
  let _message;
  let _customer;
  let _customer2;

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentFactory({});
    _brand = await brandFactory({});
    _tag = await tagsFactory({});
    _message = await engageMessageFactory({ kind: 'auto' });
    _customer = await customerFactory({});
    _customer2 = await customerFactory({});
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Segments.deleteMany({});
    await EngageMessages.deleteMany({});
    await Brands.deleteMany({});
    await Tags.deleteMany({});
    await Customers.deleteMany({});
  });

  test('create messages', async () => {
    const doc = {
      kind: 'manual',
      title: 'Message test',
      fromUserId: _user._id,
      segmentIds: [_segment._id],
      brandIds: [_brand._id],
      tagIds: [_tag._id],
      isLive: true,
      isDraft: false,
    };

    const message = await EngageMessages.createEngageMessage(doc);
    expect(message.kind).toEqual(doc.kind);
    expect(message.title).toEqual(doc.title);
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentIds).toEqual(expect.arrayContaining(doc.segmentIds));
    expect(message.brandIds).toEqual(expect.arrayContaining(doc.brandIds));
    expect(message.tagIds).toEqual(expect.arrayContaining(doc.tagIds));
    expect(message.isLive).toEqual(doc.isLive);
    expect(message.isDraft).toEqual(doc.isDraft);
  });

  test('update messages', async () => {
    const message = await EngageMessages.updateEngageMessage(_message._id, {
      title: 'Message test updated',
      fromUserId: _user._id,
      segmentIds: [_segment._id],
      brandIds: [_brand._id],
      tagIds: [_tag._id],
    });

    expect(message.title).toEqual('Message test updated');
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentIds).toEqual(expect.arrayContaining([_segment._id]));
    expect(message.brandIds).toEqual(expect.arrayContaining([_brand._id]));
    expect(message.tagIds).toEqual(expect.arrayContaining([_tag._id]));
  });

  test('update messages: can not update manual message', async () => {
    expect.assertions(1);

    const manualMessage = await engageMessageFactory({
      kind: 'manual',
    });

    try {
      await EngageMessages.updateEngageMessage(manualMessage._id, {
        title: 'Message test updated',
      });
    } catch (e) {
      expect(e.message).toBe('Can not update manual message');
    }
  });

  test('remove a message', async () => {
    await EngageMessages.removeEngageMessage(_message._id);

    const messagesCounts = await EngageMessages.find({}).countDocuments();

    expect(messagesCounts).toBe(0);
  });

  test('remove a message: can not remove manual message ', async () => {
    expect.assertions(1);

    const manualMessage = await engageMessageFactory({ kind: 'manual' });

    try {
      await EngageMessages.removeEngageMessage(manualMessage._id);
    } catch (e) {
      expect(e.message).toBe('Can not remove manual message');
    }
  });

  test('Engage message set live', async () => {
    await EngageMessages.engageMessageSetLive(_message._id);
    const message = await EngageMessages.findOne({ _id: _message._id });

    if (!message) {
      throw new Error('Engage message not found');
    }

    expect(message.isLive).toEqual(true);
    expect(message.isDraft).toEqual(false);
  });

  test('Engage message set pause', async () => {
    await EngageMessages.engageMessageSetPause(_message._id);
    const message = await EngageMessages.findOne({ _id: _message._id });

    if (!message) {
      throw new Error('Engage message not found');
    }

    expect(message.isLive).toEqual(false);
  });

  test('Engage message remove not found', async () => {
    expect.assertions(1);

    try {
      await EngageMessages.removeEngageMessage(_segment._id);
    } catch (e) {
      expect(e.message).toEqual(`Engage message not found with id ${_segment._id}`);
    }
  });

  test('save matched customer ids', async () => {
    const message = await EngageMessages.setCustomerIds(_message._id, [_customer, _customer2]);

    if (!message || !message.customerIds) {
      throw new Error('Engage message not found');
    }

    expect(message.customerIds).toContain(_customer._id);
    expect(message.customerIds).toContain(_customer2._id);
    expect(message.customerIds.length).toEqual(2);
  });

  test('changeCustomer', async () => {
    const customer = await customerFactory({});
    const newCustomer = await customerFactory({});

    await EngageMessages.changeCustomer(newCustomer._id, [customer._id]);

    expect(
      await EngageMessages.find({
        customerIds: { $in: [newCustomer._id] },
      }),
    ).toHaveLength(0);

    expect(
      await EngageMessages.find({
        messengerReceivedCustomerIds: { $in: [newCustomer._id] },
      }),
    ).toHaveLength(0);
  });

  test('removeCustomerEngages', async () => {
    const customer = await customerFactory({});

    await engageMessageFactory({
      customerIds: [customer._id],
    });

    await EngageMessages.removeCustomerEngages(customer._id);

    const engageMessages = await EngageMessages.find({
      customerIds: { $in: [customer._id] },
    });

    const messengerReceivedCustomerIds = await EngageMessages.find({
      messengerReceivedCustomerIds: { $in: [customer._id] },
    });

    expect(engageMessages).toHaveLength(0);
    expect(messengerReceivedCustomerIds).toHaveLength(0);
  });
});
