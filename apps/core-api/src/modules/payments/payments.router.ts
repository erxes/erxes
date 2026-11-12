import { db } from '@erxes/core-db';
import {
  listPluginSettings,
  listRefunds,
  refundInvoice,
  updatePluginSettings,
  addGateway,
  cancelInvoice,
  createInvoice,
  getInvoice,
  listGateways,
  listInvoices,
  payTestInvoice,
  removeGateway,
  updateGateway,
} from '~/modules/payments/payments.service';
import { authed, anyone } from '~/orpc';

export const paymentsRouter = {
  gateways: authed.payments.gateways.handler(({ context }) => listGateways(db(), context.actor)),
  addGateway: authed.payments.addGateway.handler(({ input, context }) =>
    addGateway(db(), context.actor, input),
  ),
  updateGateway: authed.payments.updateGateway.handler(({ input: { id, ...changes }, context }) =>
    updateGateway(db(), context.actor, id, changes),
  ),
  removeGateway: authed.payments.removeGateway.handler(({ input, context }) =>
    removeGateway(db(), context.actor, input.id),
  ),
  createInvoice: anyone.payments.createInvoice.handler(({ input, context }) =>
    createInvoice(db(), context.caller, input),
  ),
  getInvoice: anyone.payments.getInvoice.handler(({ input, context }) =>
    getInvoice(db(), context.caller, input.id),
  ),
  cancelInvoice: anyone.payments.cancelInvoice.handler(({ input, context }) =>
    cancelInvoice(db(), context.caller, input.id),
  ),
  invoices: authed.payments.invoices.handler(({ input, context }) =>
    listInvoices(db(), context.actor, input),
  ),
  refund: anyone.payments.refund.handler(({ input, context }) =>
    refundInvoice(db(), context.caller, input),
  ),
  refunds: anyone.payments.refunds.handler(({ input, context }) =>
    listRefunds(db(), context.caller, input.id),
  ),
  pluginSettings: authed.payments.pluginSettings.handler(({ context }) =>
    listPluginSettings(db(), context.actor),
  ),
  updatePluginSettings: authed.payments.updatePluginSettings.handler(({ input, context }) =>
    updatePluginSettings(db(), context.actor, input),
  ),
  payTestInvoice: authed.payments.payTestInvoice.handler(({ input, context }) =>
    payTestInvoice(db(), context.actor, input.id),
  ),
};
