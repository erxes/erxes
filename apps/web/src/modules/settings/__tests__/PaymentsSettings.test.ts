// @vitest-environment happy-dom
import type {
  EbarimtReceipt,
  Integration,
  IntegrationConnection,
  Invoice,
  VaultConnection,
} from '@erxes/core-contract';
import { setConnectionPicker } from 'erxes-ui';
import { act } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { lazyNamed } from '~/lib/lazyNamed';
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
  plugin: null,
  status: 'active',
  problem: null,
  createdAt: CREATED,
  settings: {},
} satisfies IntegrationConnection;

const CONNECTION = { ...GATEWAY, usedBy: [] } satisfies VaultConnection;

const TEST_INTEGRATION = {
  key: 'test',
  plugin: null,
  name: 'Test',
  summary: 'Pays at once, for trying payments out.',
  category: 'payments',
  countries: [],
  permission: 'integrations.manage',
  dashboard: null,
  keyed: true,
  fields: [],
  payments: { currencies: ['MNT'], refunds: 'full', pays: 'at once' },
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
} satisfies Invoice;

const RECEIPT = {
  id: 'receipt-1',
  invoiceId: INVOICE.id,
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
} satisfies EbarimtReceipt;

const PAGE_INFO = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

const gate = () => {
  let resolveOpened: (() => void) | undefined;

  const opened = new Promise<void>((resolve) => {
    resolveOpened = resolve;
  });

  const release = () => resolveOpened?.();

  return { opened, release, open: () => act(async () => release()) };
};

const settingsAnswer = gate();
const pickerCode = gate();
const pickerAsked = gate();
const connectionsAnswer = gate();

const answers: Record<string, () => Promise<unknown>> = {
  '/core/v1/payments/gateways': async () => ({ data: [GATEWAY] }),
  '/core/v1/payments/settings': async () => {
    await settingsAnswer.opened;

    return { defaultGatewayId: null };
  },
  '/core/v1/payments/invoices': async () => ({ data: [INVOICE], pageInfo: PAGE_INFO }),
  [`/core/v1/payments/invoices/${INVOICE.id}/refunds`]: async () => ({ data: [] }),
  '/core/v1/ebarimt/receipts': async () => ({ data: [RECEIPT], pageInfo: PAGE_INFO }),
  '/core/v1/integrations': async () => ({ data: [TEST_INTEGRATION] }),
  '/core/v1/integrations/connections': async () => {
    await connectionsAnswer.opened;

    return { data: [CONNECTION] };
  },
};

beforeAll(async () => {
  await setUpSettings();
  vi.stubGlobal('fetch', async (request: Request) => {
    const answer = answers[new URL(request.url).pathname];

    if (!answer) throw new Error('offline');

    return Response.json(await answer());
  });
  setConnectionPicker(
    lazyNamed(async () => {
      pickerAsked.release();
      await pickerCode.opened;

      return import('../vault/ConnectionPicker');
    }, 'ConnectionPicker'),
  );
});

afterEach(unmount);

const defaultGateway = (container: Element) => {
  const heading = [...container.querySelectorAll('h2')].find(
    (element) => element.textContent === 'Default gateway',
  );

  const section = heading?.closest('section');

  if (!section) throw new Error('no Default gateway section');

  return section;
};

const holdsPickerPlace = (container: Element) =>
  defaultGateway(container).querySelector('.animate-pulse.h-8') !== null;

const invoiceDialog = () =>
  [...document.querySelectorAll('[role="dialog"]')].find((dialog) =>
    dialog.textContent?.includes('Order R1'),
  );

describe('Settings › Payments', () => {
  it('keeps the default gateway picker’s place while it loads, so a clicked invoice opens and stays open', async () => {
    const container = await renderSettings('/settings/payments', 'Order R1');

    expect(holdsPickerPlace(container)).toBe(true);

    await settingsAnswer.open();
    await act(() => pickerAsked.opened);
    expect(holdsPickerPlace(container)).toBe(true);

    const row = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Order R1'),
    );

    await act(async () => row?.click());
    await vi.waitFor(() => expect(invoiceDialog()?.textContent).toContain('Failed'));

    await pickerCode.open();
    expect(holdsPickerPlace(container)).toBe(true);

    await connectionsAnswer.open();
    await vi.waitFor(() =>
      expect(defaultGateway(container).textContent).toContain('None: the first connected one'),
    );
    expect(invoiceDialog()?.textContent).toContain('Failed');
  });
});
