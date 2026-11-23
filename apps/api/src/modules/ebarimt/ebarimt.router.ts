import { db } from '@erxes/core-db';
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
  configs,
  createConfig,
  removeConfig,
  testConnection,
  updateConfig,
} from '~/modules/ebarimt/settings.service';
import { scoped, unscoped } from '~/orpc';

export const ebarimtRouter = {
  configs: scoped.ebarimt.configs.handler(() => configs(db())),
  createConfig: scoped.ebarimt.createConfig.handler(({ input }) => createConfig(db(), input)),
  updateConfig: scoped.ebarimt.updateConfig.handler(({ input }) => updateConfig(db(), input)),
  removeConfig: scoped.ebarimt.removeConfig.handler(({ input }) => removeConfig(db(), input.id)),
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
