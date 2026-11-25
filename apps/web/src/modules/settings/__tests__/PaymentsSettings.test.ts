// @vitest-environment happy-dom
import type { EbarimtReceipt, Integration, Invoice, PaymentGateway } from '@erxes/core-contract';
import { act } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { renderSettings, setUpSettings, unmount } from './settingsHarness';

vi.mock('@module-federation/enhanced/runtime', () => ({
  registerRemotes: () => undefined,
  loadRemote: async (id: string) => ({
    CONFIG: (await import('./settingsHarness')).CONFIGS[id],
  }),
}));

vi.mock('~/modules/auth/session', () => ({
  useCan: () => () => true,
  useSession: () => ({ organization: { country: 'MN', currency: 'MNT' } }),
}));

const CREATED = '2026-11-20T08:00:00.000Z';

const GATEWAY = {
  id: 'gateway-1',
  key: 'test',
  name: 'Test gateway',
  status: 'active',
  ownerId: null,
  createdAt: CREATED,
  settings: {},
  integrationName: 'Test',
  pays: 'test',
} satisfies PaymentGateway;

const SHOP = {
  ...GATEWAY,
  id: 'gateway-2',
  key: 'qpay',
  name: 'QPay shop',
  integrationName: 'QPay',
  pays: 'bank-qr',
} satisfies PaymentGateway;

const TEST_INTEGRATION = {
  key: 'test',
  plugin: null,
  connection: null,
  name: 'Test',
  summary: 'Pays at once, for trying payments out.',
  category: 'payments',
  countries: [],
  permission: 'integrations.manage',
  scopes: ['org'],
  dashboard: null,
  keyed: true,
  fields: [],
  payments: { currencies: ['MNT'], refunds: 'full', pays: 'at once' },
  sms: false,
  oauth: null,
  status: { state: 'connected', count: 1 },
  actions: [],
} satisfies Integration;

const INVOICE = {
  id: 'invoice-1',
  gatewayId: GATEWAY.id,
  method: 'gateway',
  source: 'core',
  amount: 150_000,
  currency: 'MNT',
  description: 'Order R1',
  referenceType: 'order',
  referenceId: 'R1',
  status: 'paid',
  metadata: {},
  lines: [],
  taxBuyer: null,
  taxReceipt: true,
  paidAmount: 150_000,
  refundedAmount: 0,
  payment: {
    qrText: null,
    qrImage: null,
    shortUrl: null,
    links: [],
    inApp: null,
    bankTransfer: null,
  },
  expiresAt: CREATED,
  paidAt: CREATED,
  createdAt: CREATED,
  gatewayKind: 'test',
  refundable: { amount: 0, gateway: 'full' },
  ebarimtId: null,
} satisfies Invoice;

const RECEIPT = {
  id: 'receipt-1',
  invoiceId: INVOICE.id,
  settingsId: 'config-1',
  kind: 'put',
  status: 'failed',
  previousId: null,
  buyerType: 'B2C_RECEIPT',
  customerTin: null,
  customerName: null,
  consumerNo: null,
  totalAmount: 150_000,
  totalVat: 0,
  totalCityTax: 0,
  billId: null,
  billDate: null,
  lottery: null,
  qrData: null,
  error: 'PosAPI is unreachable',
  inactiveAt: null,
  createdAt: CREATED,
  updatedAt: CREATED,
  source: 'core',
  referenceType: 'order',
  referenceId: 'R1',
  currency: 'MNT',
  recorded: false,
} satisfies EbarimtReceipt;

const PAGE_INFO = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

let defaultGatewayId: string | null = null;

const answers: Record<string, (request: Request) => Promise<unknown>> = {
  '/core/v1/payments/gateways': async () => ({ data: [GATEWAY, SHOP] }),
  '/core/v1/payments/settings': async (request) => {
    if (request.method === 'PUT') {
      ({ defaultGatewayId } = z
        .object({ defaultGatewayId: z.string().nullable() })
        .parse(await request.json()));
    }

    return { defaultGatewayId };
  },
  '/core/v1/payments/invoices': async () => ({ data: [INVOICE], pageInfo: PAGE_INFO }),
  [`/core/v1/payments/invoices/${INVOICE.id}/refunds`]: async () => ({ data: [] }),
  '/core/v1/ebarimt/receipts': async () => ({ data: [RECEIPT], pageInfo: PAGE_INFO }),
  '/core/v1/integrations': async () => ({ data: [TEST_INTEGRATION] }),
};

beforeAll(async () => {
  await setUpSettings();
  vi.stubGlobal('fetch', async (request: Request) => {
    const answer = answers[new URL(request.url).pathname];

    if (!answer) throw new Error('offline');

    return Response.json(await answer(request));
  });
});

afterEach(unmount);

/** The gateway's row in the list, by its connection name. */
const rowOf = (container: Element, name: string) =>
  [...container.querySelectorAll('li')].find((row) => row.textContent?.includes(name));

const invoiceDialog = () =>
  [...document.querySelectorAll('[role="dialog"]')].find((dialog) =>
    dialog.textContent?.includes('Order R1'),
  );

describe('Settings › Payments', () => {
  it('lists the gateways with the default marked, moves it, and opens an invoice', async () => {
    const container = await renderSettings('/settings/payments', 'Order R1');

    // None picked: the oldest one that's on takes the invoices.
    await vi.waitFor(() =>
      expect(rowOf(container, 'Test gateway')?.textContent).toContain('Default'),
    );
    expect(rowOf(container, 'QPay shop')?.textContent).toContain('QPay');

    const makeDefault = [...(rowOf(container, 'QPay shop')?.querySelectorAll('button') ?? [])].find(
      (button) => button.textContent === 'Make default',
    );

    await act(async () => makeDefault?.click());
    await vi.waitFor(() => expect(rowOf(container, 'QPay shop')?.textContent).toContain('Default'));
    expect(defaultGatewayId).toBe(SHOP.id);
    expect(rowOf(container, 'Test gateway')?.textContent).toContain('Make default');

    const row = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Order R1'),
    );

    await act(async () => row?.click());
    await vi.waitFor(() => expect(invoiceDialog()?.textContent).toContain('Failed'));
  });
});
