import {
  customerMessageRoute,
  findCustomerConversation,
} from '../messages/customerMessage';

const HOUR = 60 * 60 * 1000;
const now = Date.parse('2026-11-11T12:00:00Z');
const ago = (hours: number) => new Date(now - hours * HOUR);

describe('customerMessageRoute', () => {
  it('sends freely within a day, with HUMAN_AGENT within a week, not after', () => {
    expect(customerMessageRoute(ago(3), now)).toEqual({ allowed: true });
    expect(customerMessageRoute(ago(30), now)).toEqual({
      allowed: true,
      tag: 'HUMAN_AGENT',
    });
    expect(customerMessageRoute(ago(24 * 8), now)).toEqual({ allowed: false });
    expect(customerMessageRoute(undefined, now)).toEqual({ allowed: false });
  });
});

describe('findCustomerConversation', () => {
  const build = (psids: string[]) => {
    const findOne = jest.fn(() => ({
      sort: () => ({ lean: async () => ({ _id: 'conv-1' }) }),
    }));
    const models = {
      FacebookCustomers: {
        find: jest.fn(() => ({
          lean: async () => psids.map((userId) => ({ userId })),
        })),
      },
      FacebookConversations: { findOne },
    };

    return { models: models as never, findOne };
  };

  it("finds the customer's latest conversation, on the chosen page", async () => {
    const { models, findOne } = build(['psid-1', 'psid-2']);

    await expect(
      findCustomerConversation(models, 'cus-1', 'bot-1'),
    ).resolves.toEqual({ _id: 'conv-1' });
    expect(findOne).toHaveBeenCalledWith({
      senderId: { $in: ['psid-1', 'psid-2'] },
      botId: 'bot-1',
    });
  });

  it('finds nothing for a customer never on Messenger', async () => {
    const { models, findOne } = build([]);

    await expect(findCustomerConversation(models, 'cus-1')).resolves.toBeNull();
    expect(findOne).not.toHaveBeenCalled();
  });
});
