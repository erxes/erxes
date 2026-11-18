import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getInventoryShortageError } from '../inventories';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
  fixNum: (value: number) => Number(value.toFixed(4)),
}));

const send = jest.mocked(sendTRPCMessage);
const findAccount = jest.fn();
const models = {
  Accounts: { findOne: findAccount },
} as unknown as IModels;
const params = {
  productId: 'product-a',
  accountId: 'account-a',
  branchId: 'branch-a',
  departmentId: 'department-a',
  date: new Date('2026-11-04T09:00:00.000Z'),
  journal: 'out' as const,
  remainder: 2.1,
  required: 5.3,
};

beforeEach(() => {
  send.mockReset();
  findAccount.mockReset();
  send.mockImplementation(async ({ module }) => {
    if (module === 'products') return { code: 'P01', name: 'Flour $&' };
    if (module === 'branches') return { code: 'B01', title: 'Warehouse' };
    return { code: 'D01', title: 'Production' };
  });
  findAccount.mockResolvedValue({ code: '1501', name: 'Raw materials' });
});

it.each(['out', 'move', 'sale'] as const)(
  'identifies the failing product, day, location and quantities for %s',
  async (journal) => {
    const error = await getInventoryShortageError('tenant-a', models, {
      ...params,
      journal,
    });

    expect(error).toBe(
      `Not enough stock (${journal}). Date: 2026-11-04; Product: P01 - Flour $&; Account: 1501 - Raw materials; Branch: B01 - Warehouse; Department: D01 - Production; Available: 2.1; Required: 5.3; Shortage: 3.2`,
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        subdomain: 'tenant-a',
        pluginName: 'core',
        module: 'products',
        action: 'findOne',
        input: { query: { _id: 'product-a' } },
      }),
    );
    expect(findAccount).toHaveBeenCalledWith({ _id: 'account-a' });
  },
);

it('uses readable missing-record labels without exposing ids', async () => {
  send.mockResolvedValue(null);
  findAccount.mockResolvedValue(null);

  const error = await getInventoryShortageError('tenant-a', models, params);

  expect(error).toContain('Product: Unknown product; Account: Unknown account');
  expect(error).toContain(
    'Branch: Unknown branch; Department: Unknown department',
  );
  expect(error).not.toMatch(
    /[{}]|undefined|null|product-a|account-a|branch-a|department-a/,
  );
});

it('preserves the stock error when label lookups fail', async () => {
  send.mockRejectedValue(new Error('Core unavailable'));
  findAccount.mockRejectedValue(new Error('Account unavailable'));

  const error = await getInventoryShortageError('tenant-a', models, params);

  expect(error).toContain('Product: Unknown product; Account: Unknown account');
  expect(error).toContain(
    'Branch: Unknown branch; Department: Unknown department',
  );
  expect(error).toContain('Available: 2.1; Required: 5.3; Shortage: 3.2');
  expect(error).not.toContain('unavailable');
});

it.each(['_', ''])(
  'labels unassigned locations (%s) without looking them up',
  async (id) => {
    const error = await getInventoryShortageError('tenant-a', models, {
      ...params,
      branchId: id,
      departmentId: id,
    });

    expect(error).toContain('Branch: Unassigned; Department: Unassigned');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ module: 'products' }),
    );
  },
);

it('keeps partial labels readable and successful lookups when another fails', async () => {
  send.mockImplementation(async ({ module }) => {
    if (module === 'products') return { code: 'P01' };
    if (module === 'branches') throw new Error('Branch unavailable');
    return { title: 'Production' };
  });
  findAccount.mockResolvedValue({ name: 'Raw materials' });

  const error = await getInventoryShortageError('tenant-a', models, params);

  expect(error).toContain('Product: P01; Account: Raw materials');
  expect(error).toContain('Branch: Unknown branch; Department: Production');
  expect(error).not.toMatch(
    /[{}]|undefined|null|product-a|account-a|branch-a|department-a/,
  );
});

it('shows only names when product, account and location codes are absent', async () => {
  send.mockImplementation(async ({ module }) => {
    if (module === 'products') return { name: 'Flour' };
    if (module === 'branches') return { title: 'Warehouse' };
    return { title: 'Production' };
  });
  findAccount.mockResolvedValue({ name: 'Raw materials' });

  const error = await getInventoryShortageError('tenant-a', models, params);

  expect(error).toContain(
    'Product: Flour; Account: Raw materials; Branch: Warehouse; Department: Production',
  );
  expect(error).not.toMatch(/product-a|account-a|branch-a|department-a/);
});
