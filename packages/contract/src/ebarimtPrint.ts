import { ebarimtPrintTemplates } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf, readsByPost } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { EbarimtPaperSize, EbarimtPrintBlockType } from './values';

/** One part of a printed receipt; `visible: false` leaves it off. */
export const EbarimtPrintBlock = z.object({ type: EbarimtPrintBlockType, visible: z.boolean() });

export type EbarimtPrintBlock = z.infer<typeof EbarimtPrintBlock>;

/**
 * How a plugin's receipts print. Every part is in `blocks`, in print order.
 * `updatedAt` null: core's default, never changed.
 */
export const EbarimtPrintTemplate = createSelectSchema(ebarimtPrintTemplates, {
  blocks: z.array(EbarimtPrintBlock),
})
  .pick({ plugin: true, paperSize: true, blocks: true, headerText: true, footerText: true })
  .extend({ title: z.string(), updatedAt: isoDate().nullable() });

export type EbarimtPrintTemplate = z.infer<typeof EbarimtPrintTemplate>;

const blockList = z
  .array(EbarimtPrintBlock)
  .max(EbarimtPrintBlockType.options.length)
  .refine(
    (blocks) => new Set(blocks.map((block) => block.type)).size === blocks.length,
    'each part once',
  );

const printText = (text: z.ZodString) => text.trim().max(1000);

const EbarimtPrintTemplateInput = createUpdateSchema(ebarimtPrintTemplates, {
  blocks: blockList.optional(),
  headerText: printText,
  footerText: printText,
}).pick({ paperSize: true, blocks: true, headerText: true, footerText: true });

/** A receipt ready to print: a whole HTML page sized for its paper. */
export const PrintedReceipt = z.object({ paperSize: EbarimtPaperSize, html: z.string() });

export type PrintedReceipt = z.infer<typeof PrintedReceipt>;

const { EBARIMT_NOT_SET_UP, RECEIPT_NOT_PRINTABLE } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, EBARIMT_NOT_SET_UP, RECEIPT_NOT_PRINTABLE });

const PluginRef = z.object({ plugin: z.string().min(1).max(40) });

/**
 * How eBarimt receipts print: one template per plugin eBarimt issues receipts
 * for (its paper, its parts in order, a header and a footer), set up in
 * Settings › Integrations › eBarimt › Print. Core prints a receipt with its
 * plugin's template; a plugin shows the page and prints it.
 */
export const ebarimtPrintContract = {
  printTemplates: base
    .route({
      method: 'GET',
      path: '/ebarimt/print-templates',
      summary: 'List receipt print templates',
      description:
        'How each plugin eBarimt issues receipts for prints them, its default until it is changed',
    })
    .output(listOf(EbarimtPrintTemplate)),
  savePrintTemplate: base
    .route({
      method: 'PUT',
      path: '/ebarimt/print-templates/{plugin}',
      summary: 'Change a receipt print template',
      description:
        'Change how a plugin’s receipts print. 409 EBARIMT_NOT_SET_UP, INVALID_INPUT for a plugin eBarimt doesn’t issue receipts for',
    })
    .input(PluginRef.extend(EbarimtPrintTemplateInput.shape))
    .output(EbarimtPrintTemplate),
  resetPrintTemplate: base
    .route({
      method: 'DELETE',
      path: '/ebarimt/print-templates/{plugin}',
      summary: 'Reset a receipt print template',
      description: 'Print a plugin’s receipts the default way again',
    })
    .input(PluginRef)
    .output(EbarimtPrintTemplate),
  previewPrint: base
    .route({
      method: 'POST',
      path: '/ebarimt/print-templates/preview',
      spec: readsByPost,
      summary: 'Preview a receipt print',
      description:
        'A sample receipt printed with this template, before saving it. 409 EBARIMT_NOT_SET_UP',
    })
    .input(EbarimtPrintTemplateInput.required({ paperSize: true, blocks: true }))
    .output(PrintedReceipt),
  printReceipt: base
    .route({
      method: 'GET',
      path: '/ebarimt/receipts/{id}/print',
      summary: 'Print a receipt',
      description:
        'An issued receipt as a page to print, with its plugin’s template; a plugin prints its own invoices’ only. 409 RECEIPT_NOT_PRINTABLE for a failed, pending, returned or replaced one',
    })
    .input(z.object({ id: Id }))
    .output(PrintedReceipt),
  emailReceipt: base
    .errors({ EMAIL_NOT_CONFIGURED: ERRORS.EMAIL_NOT_CONFIGURED })
    .route({
      method: 'POST',
      path: '/ebarimt/receipts/{id}/email',
      summary: 'Email a receipt',
      description:
        'Email an issued receipt as its plugin’s template prints it, with its QR code; a plugin emails its own invoices’ only. 409 RECEIPT_NOT_PRINTABLE for a failed, pending, returned or replaced one, EMAIL_NOT_CONFIGURED when email can’t be delivered',
    })
    .input(z.object({ id: Id, to: z.email().max(254) }))
    .output(z.object({ ok: z.literal(true) })),
};
