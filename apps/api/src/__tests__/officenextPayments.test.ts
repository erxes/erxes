import { describe, expect, it } from 'vite-plus/test';
import { gatewayConfigOf } from '../../scripts/officenext/gateways';
import {
  invoiceRow,
  OldInvoice,
  referenceOf,
  Transaction,
} from '../../scripts/officenext/invoices';
import { inForce, invoiceOf, Receipt, receiptRow } from '../../scripts/officenext/receipts';
import { eventTypesOf } from '../../scripts/officenext/webhooks';

// Old erxes documents as Mongo returns them: `_id` and loose types. Credentials are made up.
describe('officenext import: payment gateways', () => {
  it("renames an old gateway's settings to core's", () => {
    expect(
      gatewayConfigOf('qpay', {
        qpayMerchantUser: 'MERCHANT',
        qpayMerchantPassword: 'not-a-real-secret',
        qpayInvoiceCode: 'MERCHANT_INVOICE',
      }),
    ).toEqual({
      config: {
        kind: 'qpay',
        clientId: 'MERCHANT',
        clientSecret: 'not-a-real-secret',
        invoiceCode: 'MERCHANT_INVOICE',
        sandbox: false,
      },
    });
  });

  it('names the missing settings, never their values, and the kinds core lacks', () => {
    expect(
      gatewayConfigOf('storepay', { merchantUsername: 'shop', merchantPassword: 'hidden-value' }),
    ).toEqual({
      skip: "storepay settings core can't use: appPassword, appUsername, storeId missing or invalid",
    });
    expect(JSON.stringify(gatewayConfigOf('qpayQuickqr', { merchantId: 'm1' }))).toContain(
      'QPay quick QR: core has no gateway',
    );
    expect(gatewayConfigOf('minupay', {})).toEqual({ skip: 'no core gateway for minupay' });
  });
});

/** An invoice of a deal, as the newer payment plugin stored it. */
const invoice = (fields: Record<string, unknown>) =>
  OldInvoice.parse({
    _id: 'inv1',
    amount: 15000,
    invoiceNumber: 'INV-7',
    contentType: 'sales:deals',
    contentTypeId: 'deal1',
    createdAt: new Date('2024-02-01T10:00:00Z'),
    ...fields,
  });

describe('officenext import: invoices', () => {
  const paidAt = new Date('2024-02-01T10:05:00Z');

  it('takes a paid invoice from its transaction; a gateway core lacks makes it a transfer', () => {
    const paid = new Map([
      [
        'inv1',
        Transaction.parse({
          _id: 't1',
          invoiceId: 'inv1',
          paymentId: 'quickqr1',
          status: 'paid',
          updatedAt: paidAt,
        }),
      ],
    ]);

    const placed = invoiceRow(invoice({ status: 'paid', paymentIds: ['quickqr1', 'qpay1'] }), {
      gateways: new Set(['qpay1']),
      paid,
      customers: new Set(),
    });

    expect('row' in placed && placed.row.slice(0, 16)).toEqual([
      'inv1',
      null,
      'transfer',
      'sales',
      'deal',
      'deal1',
      1_500_000,
      'MNT',
      'Invoice INV-7',
      'paid',
      expect.any(String),
      false,
      1_500_000,
      0,
      paidAt,
      paidAt,
    ]);
  });

  it('brings a pending invoice in expired, at the first gateway core has', () => {
    const placed = invoiceRow(invoice({ status: 'pending', paymentIds: ['quickqr1', 'qpay1'] }), {
      gateways: new Set(['qpay1']),
      paid: new Map(),
      customers: new Set(),
    });

    expect(
      'row' in placed && [placed.row[1], placed.row[2], placed.row[9], placed.row[15]],
    ).toEqual(['qpay1', 'gateway', 'expired', null]);
    expect(
      invoiceRow(invoice({ status: 'paid', amount: 0 }), {
        gateways: new Set(),
        paid: new Map(),
        customers: new Set(),
      }),
    ).toEqual({ skip: 'no amount' });
  });

  it('puts an invoice for nothing on core itself', () => {
    expect(referenceOf(null, null, 'inv9')).toEqual({
      source: 'core',
      referenceType: 'invoice',
      referenceId: 'inv9',
    });
  });
});

/** A deal's receipt as old erxes stored it: PosAPI's numbers as text. */
const receipt = (id: string, fields: Record<string, unknown>) =>
  Receipt.parse({
    _id: id,
    contentId: 'deal1',
    contentType: 'deal',
    success: 'true',
    billType: '1',
    amount: '25000.50',
    vat: '2272.77',
    cityTax: '0',
    cashAmount: '25000.50',
    nonCashAmount: '0',
    stocks: [{ name: 'Airag', qty: '2', unitPrice: '12500.25', totalAmount: '25000.50' }],
    ...fields,
  });

describe('officenext import: eBarimt receipts', () => {
  const refused = receipt('r1', { success: 'false', errorCode: '210', message: 'Bad TIN' });
  const returned = receipt('r2', { status: 'inactive', modifiedAt: new Date('2023-09-01') });

  const current = receipt('r3', {
    billType: '3',
    customerNo: '5317878',
    cashAmount: '0',
    nonCashAmount: '25000.50',
  });

  it('keeps the receipt in force, not the returned or refused ones', () => {
    expect(inForce([refused, returned, current])?.id).toBe('r3');
    expect(inForce([refused])).toBeNull();
  });

  it("makes the deal's invoice from the receipt in force", () => {
    const row = invoiceOf('deal1', current, refused);

    expect([row[0], row[1], row[2], row[4], row[5], row[6], row[9], row[12], row[13]]).toEqual([
      'ebarimt-deal1',
      null,
      'transfer',
      'deal',
      'deal1',
      2_500_050,
      'paid',
      JSON.stringify({ companyNo: '5317878' }),
      true,
    ]);
    expect(JSON.parse(String(row[11]))).toEqual([
      {
        productId: null,
        name: 'Airag',
        quantity: 2,
        unitPrice: 1_250_025,
        amount: 2_500_050,
        plugin: 'sales',
      },
    ]);
  });

  it('records a refused try with its error and a returned one as inactive', () => {
    expect(receiptRow(refused, 'ebarimt-deal1', null).slice(0, 6)).toEqual([
      'r1',
      'ebarimt-deal1',
      'put',
      'failed',
      null,
      'B2C_RECEIPT',
    ]);
    expect(receiptRow(refused, 'ebarimt-deal1', null)[16]).toBe('210: Bad TIN');
    expect(receiptRow(returned, 'ebarimt-deal1', null)[19]).toEqual(new Date('2023-09-01'));
    expect(receiptRow(current, 'ebarimt-deal1', 'r2').slice(3, 9)).toEqual([
      'success',
      'r2',
      'B2B_RECEIPT',
      '5317878',
      null,
      null,
    ]);
  });
});

describe('officenext import: webhooks', () => {
  it("turns old actions into core's event types and names the rest", () => {
    expect(
      eventTypesOf([
        { type: 'contacts:customer', action: 'create', label: 'Customer created' },
        { type: 'core:company', action: 'update' },
        { type: 'inbox:popupSubmitted', action: 'create' },
        { type: 'cards:deal', action: 'create' },
      ]),
    ).toEqual({
      types: ['core.customer.created', 'core.company.updated', 'frontline.form.submitted'],
      unmatched: ['cards:deal:create'],
    });
  });
});
