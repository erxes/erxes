import { db } from '@erxes/core-db';
import {
  addGateway,
  listGateways,
  removeGateway,
  updateGateway,
} from '~/modules/payments/gateways.service';
import {
  cancelInvoice,
  createInvoice,
  getInvoice,
  listInvoices,
  payTestInvoice,
} from '~/modules/payments/invoices.service';
import {
  listPluginSettings,
  updatePluginSettings,
} from '~/modules/payments/pluginSettings.service';
import { listRefunds, refundInvoice } from '~/modules/payments/refunds.service';
import { scoped, unscoped } from '~/orpc';

export const paymentsRouter = {
  gateways: scoped.payments.gateways.handler(() => listGateways(db())),
  addGateway: scoped.payments.addGateway.handler(({ input }) => addGateway(db(), input)),
  updateGateway: scoped.payments.updateGateway.handler(({ input: { id, ...changes } }) =>
    updateGateway(db(), id, changes),
  ),
  removeGateway: scoped.payments.removeGateway.handler(({ input }) =>
    removeGateway(db(), input.id),
  ),
  createInvoice: unscoped.payments.createInvoice.handler(({ input }) => createInvoice(input)),
  getInvoice: unscoped.payments.getInvoice.handler(({ input }) => getInvoice(input.id)),
  cancelInvoice: unscoped.payments.cancelInvoice.handler(({ input }) => cancelInvoice(input.id)),
  invoices: scoped.payments.invoices.handler(({ input }) => listInvoices(db(), input)),
  refund: scoped.payments.refund.handler(({ input }) => refundInvoice(db(), input)),
  refunds: scoped.payments.refunds.handler(({ input }) => listRefunds(db(), input.id)),
  pluginSettings: scoped.payments.pluginSettings.handler(() => listPluginSettings(db())),
  updatePluginSettings: scoped.payments.updatePluginSettings.handler(({ input }) =>
    updatePluginSettings(db(), input),
  ),
  payTestInvoice: unscoped.payments.payTestInvoice.handler(({ input }) => payTestInvoice(input.id)),
};
