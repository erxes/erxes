import { db } from '@erxes/core-db';
import { receiptPlugins } from '~/modules/ebarimt/plugins';
import { findCompany } from '~/modules/ebarimt/posapi';
import {
  listPrintTemplates,
  previewPrint,
  printReceipt,
  resetPrintTemplate,
  savePrintTemplate,
} from '~/modules/ebarimt/printTemplates.service';
import { emailReceipt } from '~/modules/ebarimt/receiptEmail.service';
import { listReceipts, requestSync, setBuyer } from '~/modules/ebarimt/receipts.service';
import {
  getSettings,
  removeSettings,
  saveSettings,
  testConnection,
} from '~/modules/ebarimt/settings.service';
import { scoped, unscoped } from '~/orpc';

export const ebarimtRouter = {
  settings: scoped.ebarimt.settings.handler(() => getSettings(db())),
  plugins: scoped.ebarimt.plugins.handler(() => receiptPlugins(db())),
  saveSettings: scoped.ebarimt.saveSettings.handler(({ input }) => saveSettings(db(), input)),
  removeSettings: scoped.ebarimt.removeSettings.handler(() => removeSettings(db())),
  testConnection: unscoped.ebarimt.testConnection.handler(({ input }) =>
    testConnection(input.posApiUrl),
  ),
  receipts: scoped.ebarimt.receipts.handler(({ input }) => listReceipts(db(), input)),
  sync: scoped.ebarimt.sync.handler(({ input }) => requestSync(db(), input.invoiceId)),
  setBuyer: unscoped.ebarimt.setBuyer.handler(({ input }) => setBuyer(input)),
  findCompany: unscoped.ebarimt.findCompany.handler(({ input }) => findCompany(input.no)),
  printTemplates: scoped.ebarimt.printTemplates.handler(() => listPrintTemplates(db())),
  savePrintTemplate: scoped.ebarimt.savePrintTemplate.handler(({ input }) =>
    savePrintTemplate(db(), input),
  ),
  resetPrintTemplate: scoped.ebarimt.resetPrintTemplate.handler(({ input }) =>
    resetPrintTemplate(db(), input.plugin),
  ),
  previewPrint: scoped.ebarimt.previewPrint.handler(({ input }) => previewPrint(db(), input)),
  printReceipt: scoped.ebarimt.printReceipt.handler(({ input }) => printReceipt(db(), input.id)),
  emailReceipt: scoped.ebarimt.emailReceipt.handler(({ input }) => emailReceipt(db(), input)),
};
