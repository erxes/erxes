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
import { anyone, anyoneUnscoped, authed, authedUnscoped } from '~/orpc';

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
  createInvoice: anyoneUnscoped.payments.createInvoice.handler(({ input, context }) =>
    createInvoice(context.caller, input),
  ),
  getInvoice: anyoneUnscoped.payments.getInvoice.handler(({ input, context }) =>
    getInvoice(context.caller, input.id),
  ),
  cancelInvoice: anyoneUnscoped.payments.cancelInvoice.handler(({ input, context }) =>
    cancelInvoice(context.caller, input.id),
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
  payTestInvoice: authedUnscoped.payments.payTestInvoice.handler(({ input, context }) =>
    payTestInvoice(context.actor, input.id),
  ),
};
