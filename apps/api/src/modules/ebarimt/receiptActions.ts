import { type ActionField, TaxBuyer } from '@erxes/core-contract';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { inOrder } from '~/lib/sequence';
import { parseInput, recipientsOf } from '~/modules/automations/actions/context';
import type { PagedAction } from '~/modules/integrations/define';
import { activeReceipt } from './plan';
import { emailReceipt } from './receiptEmail.service';
import { requestSync, setBuyer } from './receipts.service';

const INVOICE_FIELD: ActionField = {
  key: 'invoiceId',
  label: 'Invoice',
  type: 'text',
  required: true,
  description: 'Insert it from the payment event or the step that created it',
};

const InvoiceInput = z.object({ invoiceId: z.string().trim().min(1).max(100) });

const BuyerInput = InvoiceInput.extend({
  companyNo: TaxBuyer.shape.companyNo.unwrap(),
});

/** What eBarimt does for an invoice, as automation steps. */
export const RECEIPT_ACTIONS: PagedAction[] = [
  {
    key: 'receipt.email',
    label: 'Email the receipt',
    description:
      "Send the invoice's issued receipt, with its QR code, to the customer or addresses",
    subject: null,
    fields: [INVOICE_FIELD, { key: 'to', label: 'To', type: 'recipients', required: true }],
    outputs: [{ key: 'sent', label: 'Emails sent', type: 'number' }],
    run: async (ctx) => {
      const { invoiceId } = parseInput(ctx, InvoiceInput);
      const receipt = await activeReceipt(ctx.tx, invoiceId);

      if (!receipt) {
        throw fail('RECEIPT_NOT_PRINTABLE', 'The invoice has no issued receipt yet');
      }

      const to = recipientsOf(ctx, 'to');

      await inOrder(to, (address) => emailReceipt(ctx.tx, { id: receipt.id, to: address }));

      return { sent: to.length };
    },
  },
  {
    key: 'receipt.sync',
    label: 'Issue the receipt',
    description: 'Issue a missing receipt for the invoice, or send a failed one again',
    subject: null,
    fields: [INVOICE_FIELD],
    outputs: [],
    run: async (ctx) => requestSync(ctx.tx, parseInput(ctx, InvoiceInput).invoiceId),
  },
  {
    key: 'receipt.company',
    label: 'Issue the receipt to a company',
    description: 'The receipt goes to the company with this number; an issued one is replaced',
    subject: null,
    fields: [
      INVOICE_FIELD,
      {
        key: 'companyNo',
        label: 'Company number',
        type: 'text',
        required: true,
        description: 'Its registration or tax number, checked with the tax office',
      },
    ],
    outputs: [],
    call: async (ctx) => {
      const { invoiceId, companyNo } = parseInput(ctx, BuyerInput);

      return setBuyer({ invoiceId, taxBuyer: { companyNo } });
    },
  },
];
