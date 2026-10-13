import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { readMailVerifiedContacts } from '../recipients';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  sendTRPCMessage: jest.fn(),
}));

const send = jest.mocked(sendTRPCMessage);

describe('mail verified recipients', () => {
  beforeEach(() => send.mockReset());

  it('searches verified contacts through the tenant-scoped Core API with literal terms', async () => {
    send.mockResolvedValue([
      { _id: 'customer', primaryEmail: 'a+b@example.com' },
    ]);

    const result = await readMailVerifiedContacts('tenant', {
      searchValue: '  a+b@example.com  ',
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'tenant',
        pluginName: 'core',
        action: 'findActiveCustomers',
        throwOnError: true,
        input: expect.objectContaining({
          query: {
            emailValidationStatus: { $in: ['valid', 'verified'] },
            $and: [
              {
                $or: ['primaryEmail', 'emails', 'firstName', 'lastName'].map(
                  (field) => ({
                    [field]: { $regex: 'a\\+b@example\\.com', $options: 'i' },
                  }),
                ),
              },
            ],
          },
          limit: 101,
          skip: 0,
        }),
      }),
    );
    expect(result.pageInfo).toEqual({ endCursor: '1', hasNextPage: false });
  });

  it('bounds each page and continues from its cursor', async () => {
    send.mockResolvedValue(
      Array.from({ length: 101 }, (_, i) => ({ _id: String(i) })),
    );
    const result = await readMailVerifiedContacts('tenant', { cursor: '100' });
    expect(result.list).toHaveLength(100);
    expect(result.pageInfo).toEqual({ endCursor: '200', hasNextPage: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({ skip: 100, limit: 101 }),
      }),
    );
  });

  it.each(['-1', 'abc', '1.5', '9007199254740992'])(
    'rejects invalid cursor %s',
    async (cursor) => {
      await expect(
        readMailVerifiedContacts('tenant', { cursor }),
      ).rejects.toThrow();
      expect(send).not.toHaveBeenCalled();
    },
  );

  it('surfaces Core failures rather than reporting an empty search', async () => {
    send.mockRejectedValue(new Error('Core unavailable'));
    await expect(readMailVerifiedContacts('tenant', {})).rejects.toThrow(
      'Core unavailable',
    );
  });
});
