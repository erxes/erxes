import { db } from '@erxes/core-db';
import { findCompany } from '~/modules/ebarimt/posapi';
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
  saveSettings: scoped.ebarimt.saveSettings.handler(({ input }) => saveSettings(db(), input)),
  removeSettings: scoped.ebarimt.removeSettings.handler(() => removeSettings(db())),
  testConnection: unscoped.ebarimt.testConnection.handler(({ input }) =>
    testConnection(input.posApiUrl),
  ),
  receipts: scoped.ebarimt.receipts.handler(({ input }) => listReceipts(db(), input)),
  sync: scoped.ebarimt.sync.handler(({ input }) => requestSync(db(), input.invoiceId)),
  setBuyer: unscoped.ebarimt.setBuyer.handler(({ input }) => setBuyer(input)),
  findCompany: unscoped.ebarimt.findCompany.handler(({ input }) => findCompany(input.no)),
};
