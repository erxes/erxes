import subscription from '~/apollo/subscription';

// The iterator stands in for the channel the socket would listen on
const pubsub = { asyncIterator: (channel: string) => ({ channel }) };
const resolvers = subscription.generateResolvers(pubsub);

const staff = { subdomain: 'acme', user: { _id: 'me' } };
const anonymous = { subdomain: 'acme' };

const channelOf = (
  field: keyof typeof resolvers,
  args: Record<string, unknown>,
  context: object,
) =>
  (
    resolvers[field].subscribe(undefined, args, context) as unknown as {
      channel: string;
    }
  ).channel;

describe('notification subscriptions', () => {
  it.each([
    ['notificationInserted', 'notificationInserted:acme:me'],
    ['notificationRead', 'notificationRead:me'],
    ['notificationArchived', 'notificationArchived:me'],
  ] as const)(
    '%s listens to the signed-in user, whatever userId is asked for',
    (field, channel) => {
      expect(channelOf(field, { userId: 'someone-else' }, staff)).toBe(channel);
    },
  );

  it.each([
    'notificationInserted',
    'notificationRead',
    'notificationArchived',
  ] as const)('%s refuses a socket with no signed-in user', (field) => {
    expect(() => channelOf(field, { userId: 'me' }, anonymous)).toThrow(
      'Login required',
    );
  });
});

describe('other staff subscriptions', () => {
  it("falls back to the signed-in user's activity, not the asked one", () => {
    expect(
      channelOf('activityLogInserted', { userId: 'someone-else' }, staff),
    ).toBe('activityLogInserted:acme:me');
  });

  it.each([
    ['activityLogInserted', { targetId: 'deal-1' }],
    ['userStatusChanged', {}],
  ] as const)('%s needs a signed-in user', (field, args) => {
    expect(() => channelOf(field, args, anonymous)).toThrow('Login required');
  });
});
