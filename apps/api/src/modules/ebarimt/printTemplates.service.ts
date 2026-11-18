import {
  caller,
  type Db,
  type EbarimtPrintBlock,
  ebarimtPrintTemplates,
  ebarimtReceipts,
  paymentInvoices,
} from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { settingsOf } from './plan';
import { receiptPlugins } from './plugins';
import { allBlocks, defaultBlocks, linesOfRequest, type PrintData, renderReceipt } from './print';

type TemplateRow = typeof ebarimtPrintTemplates.$inferSelect;

interface TemplateInput {
  paperSize?: TemplateRow['paperSize'];
  blocks?: EbarimtPrintBlock[];
  headerText?: string;
  footerText?: string;
}

const toTugrik = (minor: number) => minor / 100;

/** eBarimt's settings. 409 EBARIMT_NOT_SET_UP. */
const setUp = async (client: Db) => {
  const settings = await settingsOf(client);

  if (!settings) throw fail('EBARIMT_NOT_SET_UP', 'Set up eBarimt first (Settings › Integrations)');

  return settings;
};

const defaultTemplate = (plugin: string) => ({
  plugin,
  paperSize: '80mm' as const,
  blocks: defaultBlocks(),
  headerText: '',
  footerText: '',
  updatedAt: null,
});

/** The plugin's template as saved, every part listed; core's default when none is. */
const templateOf = (plugin: string, saved: TemplateRow | undefined) =>
  saved ? { ...saved, blocks: allBlocks(saved.blocks) } : defaultTemplate(plugin);

const titles = async (client: Db) =>
  new Map((await receiptPlugins(client)).data.map((row) => [row.plugin, row.title]));

const withTitle = async <T extends { plugin: string }>(client: Db, template: T) => ({
  ...template,
  title: (await titles(client)).get(template.plugin) ?? template.plugin,
});

/** One template for each plugin eBarimt issues receipts for, in the settings' order. */
export const listPrintTemplates = async (client: Db) => {
  const settings = await settingsOf(client);

  if (!settings) return { data: [] };

  const saved = await client.select().from(ebarimtPrintTemplates);
  const named = await titles(client);

  return {
    data: settings.plugins.map((plugin) => ({
      ...templateOf(
        plugin,
        saved.find((row) => row.plugin === plugin),
      ),
      title: named.get(plugin) ?? plugin,
    })),
  };
};

/** A plugin eBarimt issues receipts for. 409 EBARIMT_NOT_SET_UP, 400 INVALID_INPUT. */
const pickedPlugin = async (client: Db, plugin: string) => {
  const settings = await setUp(client);

  if (settings.plugins.includes(plugin)) return;

  const message = `eBarimt doesn't issue receipts for ${plugin}`;

  throw fail('INVALID_INPUT', message, { issues: [{ path: ['plugin'], message }] });
};

export const savePrintTemplate = async (
  client: Db,
  { plugin, ...input }: TemplateInput & { plugin: string },
) => {
  await pickedPlugin(client, plugin);

  const values = { ...input, updatedBy: caller('user').userId, updatedAt: sql`now()` };

  const row = oneRow(
    await client
      .insert(ebarimtPrintTemplates)
      .values({ plugin, ...values })
      .onConflictDoUpdate({
        target: [ebarimtPrintTemplates.orgId, ebarimtPrintTemplates.plugin],
        set: values,
      })
      .returning(),
  );

  await recordAudit(client, {
    action: 'ebarimt.print_template_changed',
    targetType: 'ebarimt_print_template',
    targetId: plugin,
    targetLabel: plugin,
    metadata: { paperSize: row.paperSize },
  });

  return withTitle(client, templateOf(plugin, row));
};

export const resetPrintTemplate = async (client: Db, plugin: string) => {
  const removed = await client
    .delete(ebarimtPrintTemplates)
    .where(eq(ebarimtPrintTemplates.plugin, plugin))
    .returning({ plugin: ebarimtPrintTemplates.plugin });

  if (removed.length) {
    await recordAudit(client, {
      action: 'ebarimt.print_template_reset',
      targetType: 'ebarimt_print_template',
      targetId: plugin,
      targetLabel: plugin,
    });
  }

  return withTitle(client, defaultTemplate(plugin));
};

const SAMPLE_LINES = [
  { name: 'Кофе латте', qty: 2, unitPrice: 8500, totalAmount: 17_000 },
  { name: 'Бяслагтай талх', qty: 1, unitPrice: 6000, totalAmount: 6000 },
];

/** A made-up receipt from this merchant, to show a template before it is saved. */
export const previewPrint = async (
  client: Db,
  template: TemplateInput & Pick<TemplateRow, 'paperSize' | 'blocks'>,
) => {
  const settings = await setUp(client);
  const totalAmount = SAMPLE_LINES.reduce((sum, line) => sum + line.totalAmount, 0);
  const whole = 100 + settings.vatPercent + settings.cityTaxPercent;

  const data: PrintData = {
    ...settings,
    billId: '000000000000000000000000000000001',
    billDate: '2026-01-01 12:00:00',
    lottery: 'AA 00000000',
    qrData: 'eBarimt sample receipt',
    buyerType: 'B2C_RECEIPT',
    customerTin: null,
    customerName: null,
    consumerNo: null,
    lines: SAMPLE_LINES,
    totalAmount,
    totalVat: Math.round((totalAmount * settings.vatPercent) / whole),
    totalCityTax: Math.round((totalAmount * settings.cityTaxPercent) / whole),
  };

  const filled = { headerText: '', footerText: '', ...template };

  return { paperSize: filled.paperSize, html: await renderReceipt(filled, data) };
};

/**
 * An issued receipt still in force, with its plugin's template and what it
 * prints. A plugin reaches only its own invoices' receipts. 404, 409
 * RECEIPT_NOT_PRINTABLE, 409 EBARIMT_NOT_SET_UP.
 */
export const printableReceipt = async (client: Db, id: string) => {
  const [receipt] = await client
    .select({ receipt: ebarimtReceipts, source: paymentInvoices.source })
    .from(ebarimtReceipts)
    .innerJoin(paymentInvoices, eq(paymentInvoices.id, ebarimtReceipts.invoiceId))
    .where(eq(ebarimtReceipts.id, id))
    .limit(1);

  const who = caller();

  if (!receipt || (who.type === 'plugin' && who.plugin !== receipt.source)) {
    throw notFound('Receipt');
  }

  const { receipt: row, source } = receipt;

  if (row.kind !== 'put' || row.status !== 'success' || row.inactiveAt) {
    throw fail('RECEIPT_NOT_PRINTABLE', 'Only an issued receipt that is still in force prints');
  }

  const settings = await setUp(client);

  const [saved] = await client
    .select()
    .from(ebarimtPrintTemplates)
    .where(eq(ebarimtPrintTemplates.plugin, source))
    .limit(1);

  const template = templateOf(source, saved);

  const data: PrintData = {
    ...settings,
    ...row,
    lines: linesOfRequest(row.request),
    totalAmount: toTugrik(row.totalAmount),
    totalVat: toTugrik(row.totalVat),
    totalCityTax: toTugrik(row.totalCityTax),
  };

  return { receipt: row, template, data };
};

/** An issued receipt as a page to print, with its plugin's template. */
export const printReceipt = async (client: Db, id: string) => {
  const { template, data } = await printableReceipt(client, id);

  return { paperSize: template.paperSize, html: await renderReceipt(template, data) };
};
