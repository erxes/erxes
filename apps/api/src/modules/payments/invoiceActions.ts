import { type ActionField, Currency, type DataField } from '@erxes/core-contract';
import { withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { idempotencyKey, parseInput, subjectFields } from '~/modules/automations/actions/context';
import {
  CONNECTION_FIELD,
  type IntegrationCall,
  type KeyedAction,
} from '~/modules/integrations/define';
import { cancelInvoice, createInvoice, getInvoice } from './invoices.service';
import { refundInvoice } from './refunds.service';

const SMALLEST_UNIT = 'In the smallest unit: ₮1,500 is 150000, $12.50 is 1250';

const INVOICE_FIELD: ActionField = {
  key: 'invoiceId',
  label: 'Invoice',
  type: 'text',
  required: true,
  description: 'Insert it from the step that created it',
};

const INVOICE_OUTPUTS: DataField[] = [
  { key: 'invoiceId', label: 'Invoice', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'payUrl', label: 'Pay link', type: 'text' },
  { key: 'qrText', label: 'QR code text', type: 'text' },
];

const answer = (invoice: Awaited<ReturnType<typeof getInvoice>>) => ({
  invoiceId: invoice.id,
  amount: invoice.amount,
  status: invoice.status,
  payUrl: invoice.payment.shortUrl,
  qrText: invoice.payment.qrText,
});

const Amount = z.coerce.number().int().min(1).max(1_000_000_000_00);

const CreateInput = z.object({
  amount: Amount,
  currency: Currency.optional(),
  description: z.string().trim().min(1).max(255).optional(),
  expiresInMinutes: z.coerce
    .number()
    .int()
    .min(1)
    .max(60 * 24 * 7)
    .default(30),
});

const InvoiceInput = z.object({ invoiceId: z.string().trim().min(1).max(100) });

const RefundInput = InvoiceInput.extend({
  amount: Amount.optional(),
  reason: z.string().trim().min(1).max(255).optional(),
});

/** The invoice, when it went through this step's integration. */
const invoiceOf = async (ctx: IntegrationCall<unknown>, id: string) => {
  const invoice = await getInvoice(id);

  if (invoice.gatewayKind !== ctx.integration.key) {
    throw fail('INVALID_STEP_INPUT', `That invoice didn't go through ${ctx.integration.name}`);
  }

  return invoice;
};

/** The record the invoice is for: the run's customer or company, else the automation. */
const referenceOf = (ctx: IntegrationCall<unknown>) =>
  ctx.subject
    ? { referenceType: ctx.subject.type, referenceId: ctx.subject.id }
    : { referenceType: 'automation', referenceId: ctx.automation.id };

/**
 * What the `payments` ability brings every gateway to automations, through the payments
 * module: invoices, events, audit and tax receipts as for any invoice. Retry-safe: the step's
 * idempotency key is the invoice's and the refund's dedupe key.
 */
export const INVOICE_ACTIONS: KeyedAction<unknown>[] = [
  {
    key: 'invoice.create',
    label: 'Create an invoice',
    description: 'An invoice to pay through this gateway, for the customer or company of the run',
    subject: null,
    fields: [
      {
        key: 'amount',
        label: 'Amount',
        type: 'number',
        required: true,
        description: SMALLEST_UNIT,
      },
      {
        key: 'currency',
        label: 'Currency',
        type: 'text',
        required: false,
        placeholder: 'MNT',
        description: "Empty: the organisation's",
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        description: "Empty: the automation's name",
      },
      {
        key: 'expiresInMinutes',
        label: 'Payable for (minutes)',
        type: 'number',
        required: false,
        placeholder: '30',
      },
      CONNECTION_FIELD,
    ],
    outputs: INVOICE_OUTPUTS,
    async call(ctx) {
      const input = parseInput(ctx, CreateInput);
      const connection = await ctx.connection();
      const payer = subjectFields(ctx);

      return answer(
        await createInvoice({
          ...input,
          ...referenceOf(ctx),
          gatewayId: connection.id,
          description: input.description ?? ctx.automation.name,
          dedupeKey: idempotencyKey(ctx),
          metadata: { automationId: ctx.automation.id, runId: ctx.run.id },
          payerEmail: payer?.primaryEmail ?? undefined,
          payerPhone: payer?.primaryPhone ?? undefined,
        }),
      );
    },
  },
  {
    key: 'invoice.cancel',
    label: 'Cancel an invoice',
    description: 'A pending invoice can no longer be paid',
    subject: null,
    fields: [INVOICE_FIELD],
    outputs: INVOICE_OUTPUTS,
    async call(ctx) {
      const invoice = await invoiceOf(ctx, parseInput(ctx, InvoiceInput).invoiceId);

      return answer(invoice.status === 'cancelled' ? invoice : await cancelInvoice(invoice.id));
    },
  },
  {
    key: 'invoice.refund',
    label: 'Refund an invoice',
    description: 'Give back what is left of a paid invoice, or part of it',
    subject: null,
    fields: [
      INVOICE_FIELD,
      {
        key: 'amount',
        label: 'Amount',
        type: 'number',
        required: false,
        description: `Empty: all that is left. ${SMALLEST_UNIT}`,
      },
      {
        key: 'reason',
        label: 'Reason',
        type: 'text',
        required: false,
        description: "Empty: the automation's name",
      },
    ],
    outputs: [
      { key: 'refundId', label: 'Refund', type: 'text' },
      { key: 'amount', label: 'Refunded', type: 'number' },
      { key: 'status', label: 'Invoice status', type: 'text' },
    ],
    async call(ctx) {
      const input = parseInput(ctx, RefundInput);

      await invoiceOf(ctx, input.invoiceId);

      const { refund, invoice } = await withOrg(ctx.orgId, (tx) =>
        refundInvoice(tx, {
          id: input.invoiceId,
          amount: input.amount,
          reason: input.reason ?? ctx.automation.name,
          manual: false,
          dedupeKey: idempotencyKey(ctx),
        }),
      );

      if (refund.status === 'failed') {
        throw fail('GATEWAY_REFUSED', refund.error ?? `${ctx.integration.name} refused the refund`);
      }

      return { refundId: refund.id, amount: refund.amount, status: invoice.status };
    },
  },
];
