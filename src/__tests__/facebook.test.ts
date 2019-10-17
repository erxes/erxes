import { ConversationMessages, Conversations, Customers } from '../facebook/models';
import receiveMessage from '../facebook/receiveMessage';
import { facebookConversationFactory, facebookCustomerFactory, integrationFactory } from '../factories';
import Integrations from '../models/Integrations';
import './setup.ts';

const activity: any = {
  channelData: {
    sender: { id: '_id' },
    recipient: { id: 'pageId' },
    timestamp: new Date(),
    text: 'text',
    message: {
      mid: 'mid',
    },
  },
};

describe('Duplications', () => {
  beforeEach(async () => {
    // Creating test data
    await integrationFactory({
      facebookPageIds: ['pageId', 'convPageId'],
    });
  });

  afterEach(async done => {
    await Integrations.deleteMany({});
    await Customers.deleteMany({});
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});

    done();
  });

  describe('Customer', () => {
    test('customer', async () => {
      expect.assertions(1);

      try {
        await Promise.all([receiveMessage(activity), receiveMessage(activity), receiveMessage(activity)]);
      } catch (e) {
        expect(await Customers.find().countDocuments()).toBe(1);
      }
    });
  });

  describe('Conversation', () => {
    test('conversation', async () => {
      expect.assertions(1);

      await facebookCustomerFactory({ userId: '_id' });

      try {
        await Promise.all([receiveMessage(activity), receiveMessage(activity), receiveMessage(activity)]);
      } catch (e) {
        expect(await Conversations.find({}).countDocuments()).toBe(1);
      }
    });
  });

  describe('Conversation message', () => {
    test('conversation message', async () => {
      expect.assertions(1);

      await facebookCustomerFactory({ userId: '_id' });
      await facebookConversationFactory({ senderId: '_id', recipientId: 'pageId' });

      try {
        await Promise.all([receiveMessage(activity), receiveMessage(activity), receiveMessage(activity)]);
      } catch (e) {
        expect(await ConversationMessages.find({}).countDocuments()).toBe(1);
      }
    });
  });
});
