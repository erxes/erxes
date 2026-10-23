import { sendTRPCMessage } from 'erxes-api-shared/utils';
import subscription from '../subscription';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));

const sendTRPCMessageMock = sendTRPCMessage as jest.Mock;

type TContext = {
  subdomain?: string;
  user?: { _id: string };
  widgetSession?: {
    integrationId: string;
    customerId?: string;
    visitorId?: string;
  };
};

const widgetContext: TContext = {
  subdomain: 'sub',
  widgetSession: { integrationId: 'int-1', customerId: 'cust-1' },
};

type MessageEvent = {
  _id: string;
  conversationId: string;
  internal: boolean;
};

const CONVERSATION_ID = 'conversation-1';

const message = (
  _id: string,
  internal: boolean,
  conversationId = CONVERSATION_ID,
): MessageEvent => ({ _id, conversationId, internal });

const EVENTS = [
  message('customer-visible-1', false),
  message('internal-note', true),
  message('customer-visible-2', false),
  message('other-conversation', false, 'conversation-2'),
];

const iteratorOf = <T>(values: T[]): AsyncIterableIterator<T> => {
  let index = 0;

  return {
    next: async () =>
      index < values.length
        ? { value: values[index++], done: false }
        : { value: undefined, done: true },
    return: async () => ({ value: undefined, done: true }),
    throw: async (error: unknown) => {
      throw error;
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};

const pubsub = {
  asyncIterator: () =>
    iteratorOf(EVENTS.map((event) => ({ conversationMessageInserted: event }))),
};

const resolvers = subscription.generateResolvers(pubsub);

const deliveredIds = async (
  field: 'conversationMessageInserted' | 'cpConversationMessageInserted',
  context: TContext,
) => {
  const iterator = await resolvers[field].subscribe(
    undefined,
    { _id: CONVERSATION_ID },
    context,
    undefined,
  );
  const ids: string[] = [];

  for await (const payload of iterator) {
    ids.push(payload.conversationMessageInserted._id);
  }

  return ids;
};

beforeEach(() => {
  sendTRPCMessageMock.mockReset();
});

describe('conversation message subscriptions', () => {
  it("hides internal notes from the conversation owner's widget", async () => {
    sendTRPCMessageMock.mockResolvedValueOnce([{ _id: CONVERSATION_ID }]);

    await expect(
      deliveredIds('conversationMessageInserted', widgetContext),
    ).resolves.toEqual(['customer-visible-1', 'customer-visible-2']);
    expect(sendTRPCMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'conversation',
        action: 'find',
        input: {
          query: {
            _id: CONVERSATION_ID,
            integrationId: 'int-1',
            $or: [{ customerId: 'cust-1' }],
          },
        },
      }),
    );
  });

  it("refuses a widget listening to someone else's conversation", async () => {
    sendTRPCMessageMock.mockResolvedValueOnce([]);

    await expect(
      deliveredIds('conversationMessageInserted', widgetContext),
    ).rejects.toThrow('Conversation not found');
  });

  it('refuses a listener without staff login or widget session', async () => {
    await expect(
      deliveredIds('conversationMessageInserted', {}),
    ).rejects.toThrow('Conversation not found');
    expect(sendTRPCMessageMock).not.toHaveBeenCalled();
  });

  it('delivers internal notes to an authenticated team member', async () => {
    await expect(
      deliveredIds('conversationMessageInserted', { user: { _id: 'user-1' } }),
    ).resolves.toEqual([
      'customer-visible-1',
      'internal-note',
      'customer-visible-2',
    ]);
  });

  it('never delivers internal notes to the client portal', async () => {
    await expect(
      deliveredIds('cpConversationMessageInserted', {
        user: { _id: 'user-1' },
      }),
    ).resolves.toEqual(['customer-visible-1', 'customer-visible-2']);
  });
});
