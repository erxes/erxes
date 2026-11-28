import { events } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { saveEbarimt, usePosApi } from './posApi';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const issuedFor = (invoiceId: string) =>
  adminDb()
    .select({ payload: events.payload })
    .from(events)
    .where(
      and(
        eq(events.type, 'core.ebarimt.receipt_issued'),
        sql`${events.payload}->>'invoiceId' = ${invoiceId}`,
      ),
    );

describe('ebarimt events', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const { fake, settings } = usePosApi();

  beforeAll(async () => {
    await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });
    await saveEbarimt(t.owner(), settings());
  });

  it('publishes a receipt once PosAPI accepts it, not while it refuses', async () => {
    const invoice = await t.hr().payments.createInvoice({
      amount: 7_000,
      currency: 'MNT',
      description: 'Ticket',
      referenceType: 'order',
      referenceId: 'o-issued',
    });

    fake.refuse = 'Invalid merchant';

    try {
      await t.owner().payments.payTestInvoice({ id: invoice.id });
      await settle();
    } finally {
      fake.refuse = null;
    }

    const receiptsOf = async () =>
      (await t.owner().ebarimt.receipts({ invoiceId: invoice.id })).data;

    expect(await receiptsOf()).toMatchObject([{ status: 'failed' }]);
    expect(await issuedFor(invoice.id)).toEqual([]);

    await t.owner().ebarimt.sync({ invoiceId: invoice.id });
    await settle();

    const [receipt] = await receiptsOf();

    expect(receipt?.billId).toMatch(/^BILL\d+$/);
    expect(await issuedFor(invoice.id)).toMatchObject([
      {
        payload: {
          receiptId: receipt?.id,
          invoiceId: invoice.id,
          billId: receipt?.billId,
          totalAmount: 7_000,
          referenceType: 'order',
          referenceId: 'o-issued',
        },
      },
    ]);
  });
});
