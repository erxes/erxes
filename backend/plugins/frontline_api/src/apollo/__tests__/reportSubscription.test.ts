import subscription from '~/apollo/subscription';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));

it.each(['saas', 'os'])(
  'authenticates and reconciles before streaming scoped events in %s mode',
  async (version) => {
    const previous = process.env.VERSION;
    process.env.VERSION = version;
    const event = { frontlineReportsChanged: { scopes: ['ticket'] } };
    const next = jest.fn().mockResolvedValue({ value: event, done: false });
    const close = jest.fn().mockResolvedValue({ done: true });
    const asyncIterator = jest.fn(() => ({ next, return: close }));
    const resolver = subscription.generateResolvers({
      asyncIterator,
    }).frontlineReportsChanged;

    try {
      expect(() =>
        resolver.subscribe(
          null,
          {},
          { subdomain: 'tenant-a', user: undefined },
        ),
      ).toThrow('Authentication required');
      expect(asyncIterator).not.toHaveBeenCalled();
      const iterator = resolver.subscribe(
        null,
        {},
        {
          subdomain: 'tenant-a',
          user: { _id: 'u1' },
        },
      );
      expect(asyncIterator).toHaveBeenCalledWith(
        version === 'saas'
          ? ['frontlineReportsChanged:tenant-a']
          : ['frontlineReportsChanged:tenant-a', 'frontlineReportsChanged:os'],
      );
      expect((await iterator.next()).value).toEqual({
        frontlineReportsChanged: {
          scopes: ['inbox', 'ticket', 'facebook', 'call', 'charts'],
        },
      });
      expect(next).not.toHaveBeenCalled();
      expect((await iterator.next()).value).toEqual(event);
      await iterator.return();
      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      if (previous === undefined) delete process.env.VERSION;
      else process.env.VERSION = previous;
    }
  },
);
