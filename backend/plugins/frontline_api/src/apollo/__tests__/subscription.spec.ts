import subscription from '../subscription';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));

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
  context: { user?: { _id: string } },
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

describe('conversation message subscriptions', () => {
  it('hides internal notes from the unauthenticated messenger widget', async () => {
    await expect(
      deliveredIds('conversationMessageInserted', {}),
    ).resolves.toEqual(['customer-visible-1', 'customer-visible-2']);
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
