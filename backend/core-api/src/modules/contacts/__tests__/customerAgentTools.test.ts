/**
 * `customers.add` / `customers.edit` — the agent-facing customer write tools.
 *
 * The guarantees under test:
 *
 * - writes run as the acting user: an empty `ctx.userId` or an unknown user
 *   fails UNAUTHORIZED before touching the contacts models;
 * - `add` requires at least one identifying field and mirrors
 *   primaryEmail/primaryPhone into the emails/phones lists;
 * - `edit` rejects empty updates, maps a missing customer to NOT_FOUND, and
 *   unions primaries into emails/phones without duplicates;
 * - both call the same model/service layer as the GraphQL mutations;
 * - only the new procedures carry agent meta; the internal create/update
 *   procedures stay invisible.
 */

import type { CoreTRPCContext } from '~/init-trpc';
import { syncCustomerContactToCPUsers } from '@/clientportal/services/user/contactService';
import { customerRouter } from '@/contacts/trpc/customer';

jest.mock('@/clientportal/services/user/contactService', () => ({
  syncCustomerContactToCPUsers: jest.fn(async () => undefined),
}));

const mockedSync = jest.mocked(syncCustomerContactToCPUsers);

const actingUser = { _id: 'user1', email: 'agent@erxes.io' };

const leanable = <T>(value: T) => ({
  lean: jest.fn(async () => value),
});

const buildCaller = ({
  userId = 'user1',
  foundUser = actingUser,
  createCustomer = jest.fn(async (doc: unknown) => ({ _id: 'c1', doc })),
  getCustomer = jest.fn(async () => ({ _id: 'c1', emails: [], phones: [] })),
  updateCustomer = jest.fn(async (_id: string, doc: unknown) => ({
    _id,
    doc,
  })),
}: {
  userId?: string;
  foundUser?: unknown;
  createCustomer?: jest.Mock;
  getCustomer?: jest.Mock;
  updateCustomer?: jest.Mock;
} = {}) => {
  const models = {
    Users: { findOne: jest.fn(() => leanable(foundUser)) },
    Customers: { createCustomer, getCustomer, updateCustomer },
  };

  const caller = customerRouter.createCaller({
    subdomain: 'os',
    userId,
    models,
  } as unknown as CoreTRPCContext);

  return { caller, models };
};

const agentMetaOf = (path: string) =>
  (
    customerRouter._def.procedures[path] as {
      _def: { meta?: { agent?: { permission?: unknown } } };
    }
  )._def.meta?.agent;

describe('customers.add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a customer from only the provided fields and mirrors primaries into emails/phones', async () => {
    const { caller, models } = buildCaller();

    const result = await caller.customers.add({
      firstName: 'Jane',
      primaryEmail: 'jane@example.com',
      primaryPhone: '+9911',
    });

    expect(models.Customers.createCustomer).toHaveBeenCalledWith({
      firstName: 'Jane',
      primaryEmail: 'jane@example.com',
      primaryPhone: '+9911',
      emails: ['jane@example.com'],
      phones: ['+9911'],
    }, actingUser);
    expect(result).toEqual({
      _id: 'c1',
      doc: {
        firstName: 'Jane',
        primaryEmail: 'jane@example.com',
        primaryPhone: '+9911',
        emails: ['jane@example.com'],
        phones: ['+9911'],
      },
    });
  });

  it('rejects when none of firstName/lastName/primaryEmail/primaryPhone is given', async () => {
    const { caller, models } = buildCaller();

    await expect(
      caller.customers.add({ code: 'C-1' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(models.Customers.createCustomer).not.toHaveBeenCalled();
  });

  it('rejects an invalid email and an invalid state via zod', async () => {
    const { caller, models } = buildCaller();

    await expect(
      caller.customers.add({ primaryEmail: 'not-an-email' }),
    ).rejects.toThrow();
    await expect(
      caller.customers.add({
        firstName: 'Jane',
        state: 'stranger' as 'lead',
      }),
    ).rejects.toThrow();
    expect(models.Customers.createCustomer).not.toHaveBeenCalled();
  });

  it('rejects UNAUTHORIZED without an acting user', async () => {
    const { caller, models } = buildCaller({ userId: '' });

    await expect(
      caller.customers.add({ firstName: 'Jane' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(models.Users.findOne).not.toHaveBeenCalled();
    expect(models.Customers.createCustomer).not.toHaveBeenCalled();
  });

  it('rejects UNAUTHORIZED when the acting user is not found', async () => {
    const { caller, models } = buildCaller({ foundUser: null });

    await expect(
      caller.customers.add({ firstName: 'Jane' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(models.Customers.createCustomer).not.toHaveBeenCalled();
  });
});

describe('customers.edit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects an edit with no fields besides _id', async () => {
    const { caller, models } = buildCaller();

    await expect(
      caller.customers.edit({ _id: 'c1' }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(models.Customers.updateCustomer).not.toHaveBeenCalled();
  });

  it('maps a missing customer to NOT_FOUND', async () => {
    const { caller, models } = buildCaller({
      getCustomer: jest.fn(async () => {
        throw new Error('Customer not found');
      }),
    });

    await expect(
      caller.customers.edit({ _id: 'missing', firstName: 'Jane' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(models.Customers.updateCustomer).not.toHaveBeenCalled();
  });

  it('unions a new primary email/phone into emails/phones without duplicating existing ones', async () => {
    const updateCustomer = jest.fn(async (_id: string, doc: unknown) => ({
      _id,
      doc,
    }));
    const { caller } = buildCaller({
      getCustomer: jest.fn(async () => ({
        _id: 'c1',
        emails: ['old@example.com'],
        phones: ['+100'],
      })),
      updateCustomer,
    });

    await caller.customers.edit({
      _id: 'c1',
      primaryEmail: 'new@example.com',
      primaryPhone: '+100',
    });

    expect(updateCustomer).toHaveBeenCalledWith('c1', {
      primaryEmail: 'new@example.com',
      emails: ['old@example.com', 'new@example.com'],
      primaryPhone: '+100',
      phones: ['+100'],
    });
  });

  it('updates through updateCustomer and syncs the contact to client portal users', async () => {
    const { caller, models } = buildCaller();

    const result = await caller.customers.edit({
      _id: 'c1',
      firstName: 'Janet',
    });

    const doc = { firstName: 'Janet' };
    expect(models.Customers.updateCustomer).toHaveBeenCalledWith('c1', doc);
    expect(mockedSync).toHaveBeenCalledWith(models, 'c1', doc);
    expect(result).toEqual({ _id: 'c1', doc });
  });

  it('rejects UNAUTHORIZED without an acting user', async () => {
    const { caller, models } = buildCaller({ userId: '' });

    await expect(
      caller.customers.edit({ _id: 'c1', firstName: 'Jane' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(models.Customers.updateCustomer).not.toHaveBeenCalled();
  });
});

describe('internal tRPC procedures', () => {
  it('does not expose agent metadata', () => {
    expect(agentMetaOf('customers.add')).toBeUndefined();
    expect(agentMetaOf('customers.edit')).toBeUndefined();
  });
});
