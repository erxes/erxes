import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { useTestDatabase } from './db';
import { saveEbarimt, usePosApi } from './posApi';
import { settle } from './settle';
import { type CoreInputs, useTwoOrgs } from './support';

/** A recorded return of the POS sale's receipt `previousId`. */
const returnOf = (previousId: string, dedupeKey: string) => ({
  referenceType: 'pos:order',
  referenceId: 'pos1',
  dedupeKey,
  kind: 'return' as const,
  status: 'success' as const,
  previousId,
  buyerType: 'B2C_RECEIPT' as const,
  totalAmount: 15_000,
});

/** Receipts a plugin that sends its own issues, kept in core's one register. */
describe('recorded ebarimt receipts', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const { fake, settings } = usePosApi();

  /** A POS cash sale's receipt: no invoice in core. */
  const sale = {
    referenceType: 'pos:order',
    referenceId: 'pos1',
    dedupeKey: 'pos1-put',
    kind: 'put',
    status: 'success',
    buyerType: 'B2C_RECEIPT',
    consumerNo: '12345678',
    totalAmount: 15_000,
    totalVat: 1_364,
    totalCityTax: 0,
    billId: 'POSBILL1',
    billDate: '2026-11-25 09:00:00',
    lottery: 'POSLT1',
    qrData: 'POSQR1',
    request: {
      receipts: [{ items: [{ name: 'Latte', qty: 1, unitPrice: 150, totalAmount: 150 }] }],
    },
  } satisfies CoreInputs['ebarimt']['recordReceipt'];

  const statusOf = async () =>
    (await t.owner().integrations.list()).data.find((integration) => integration.key === 'ebarimt')
      ?.status;

  beforeAll(async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });
    await saveEbarimt(t.owner(), settings());
  });

  it('is refused to a plugin core issues receipts for, and to members', async () => {
    await expect(t.hr().ebarimt.recordReceipt(sale)).rejects.toMatchObject({
      status: 403,
      code: 'TAX_RECEIPTS_NOT_OWN',
    });
    await expect(t.owner().ebarimt.recordReceipt(sale)).rejects.toMatchObject({ status: 403 });

    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '2',
      scopes: ['payments:read', 'payments:write'],
      taxReceipts: 'own',
    });
  });

  it('records a sale’s receipt with no invoice once per key, and lists and prints it', async () => {
    const first = await t.hr().ebarimt.recordReceipt(sale);

    expect(first).toMatchObject({
      created: true,
      receipt: {
        invoiceId: null,
        settingsId: null,
        source: 'hr',
        referenceType: 'pos:order',
        referenceId: 'pos1',
        currency: 'MNT',
        recorded: true,
        kind: 'put',
        status: 'success',
        billId: 'POSBILL1',
        inactiveAt: null,
      },
    });
    // A retry answers the first.
    expect(await t.hr().ebarimt.recordReceipt({ ...sale, billId: 'POSBILL9' })).toMatchObject({
      created: false,
      receipt: { id: first.receipt.id, billId: 'POSBILL1' },
    });

    const id = first.receipt.id;

    expect(
      (await t.hr().ebarimt.receipts({ referenceId: 'pos1' })).data.map((row) => row.id),
    ).toEqual([id]);
    expect((await t.owner().ebarimt.receipts({ source: 'hr' })).data.map((row) => row.id)).toEqual([
      id,
    ]);
    // The other organisation sees none of it, and core sent PosAPI nothing.
    expect((await t.other().ebarimt.receipts({})).data).toEqual([]);
    await expect(t.other().ebarimt.printReceipt({ id })).rejects.toMatchObject({ status: 404 });
    expect(fake.puts).toEqual([]);

    // It prints with the default config's merchant and the lines the plugin sent.
    const printed = await t.hr().ebarimt.printReceipt({ id });

    expect(printed.html).toContain('POSBILL1');
    expect(printed.html).toContain('Latte');
    expect(printed.html).toContain('Acme Shop');
    expect(await t.hr().ebarimt.emailReceipt({ id, to: 'buyer@example.mn' })).toEqual({ ok: true });
  });

  it('returns a recorded receipt through previousId, once', async () => {
    const issued = await t.hr().ebarimt.recordReceipt({
      ...sale,
      referenceId: 'pos2',
      dedupeKey: 'pos2-put',
      billId: 'POSBILL2',
    });

    await expect(
      t.hr().ebarimt.recordReceipt({ ...returnOf(issued.receipt.id, 'x'), previousId: undefined }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      t.hr().ebarimt.recordReceipt(returnOf('no-such-receipt00', 'pos2-unknown')),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });

    const returned = await t.hr().ebarimt.recordReceipt({
      ...returnOf(issued.receipt.id, 'pos2-return'),
      referenceId: 'pos2',
    });

    expect(returned).toMatchObject({
      created: true,
      receipt: { kind: 'return', status: 'success', previousId: issued.receipt.id, recorded: true },
    });

    const [last, first] = (await t.hr().ebarimt.receipts({ referenceId: 'pos2' })).data;

    expect(last?.id).toBe(returned.receipt.id);
    expect(first?.id).toBe(issued.receipt.id);
    expect(first?.inactiveAt).not.toBeNull();
    await expect(
      t.hr().ebarimt.recordReceipt({
        ...returnOf(issued.receipt.id, 'pos2-again'),
        referenceId: 'pos2',
      }),
    ).rejects.toMatchObject({ status: 409, code: 'RECEIPT_NOT_IN_FORCE' });
    await expect(t.hr().ebarimt.printReceipt({ id: issued.receipt.id })).rejects.toMatchObject({
      status: 409,
      code: 'RECEIPT_NOT_PRINTABLE',
    });
    expect(fake.deletes).toEqual([]);
  });

  it('links a receipt to the plugin’s own invoice only, and keeps its failures off core’s list', async () => {
    const own = await t.hr().payments.recordPayment({
      method: 'cash',
      amount: 15_000,
      currency: 'MNT',
      description: 'Deal',
      referenceType: 'deal',
      referenceId: 'd1',
    });

    const walkIn = await t.owner().payments.recordPayment({
      method: 'cash',
      amount: 15_000,
      currency: 'MNT',
      description: 'Walk-in',
      referenceType: 'order',
      referenceId: 'walk1',
    });

    await settle();
    // Core sent its own invoice's receipt, and none for the plugin's.
    expect(fake.puts).toHaveLength(1);

    const failed = await t.hr().ebarimt.recordReceipt({
      ...sale,
      referenceType: 'deal',
      referenceId: 'd1',
      dedupeKey: 'd1-put',
      invoiceId: own.id,
      status: 'failed',
      billId: undefined,
      error: 'Invalid merchant',
    });

    expect(failed.receipt).toMatchObject({ invoiceId: own.id, status: 'failed', recorded: true });
    expect((await t.owner().ebarimt.receipts({ invoiceId: own.id })).data).toMatchObject([
      { id: failed.receipt.id },
    ]);
    // The plugin's failure is the plugin's to send again: eBarimt itself is fine.
    expect(await statusOf()).toEqual({ state: 'connected', count: null });

    await expect(
      t.hr().ebarimt.recordReceipt({ ...sale, dedupeKey: 'walk1-put', invoiceId: walkIn.id }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    await expect(
      t.hr().ebarimt.recordReceipt({
        ...sale,
        dedupeKey: 'pos3-put',
        settingsId: 'no-such-config000',
      }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});
