import { db } from '@erxes/core-db';
import {
  listGateways,
  listQuickQrDistricts,
  paymentSettings,
  savePaymentSettings,
} from '~/modules/payments/gateways.service';
import {
  cancelInvoice,
  createInvoice,
  getInvoice,
  listInvoices,
  payTestInvoice,
} from '~/modules/payments/invoices.service';
import { recordPayment } from '~/modules/payments/recorded.service';
import { listRefunds, refundInvoice } from '~/modules/payments/refunds.service';
import { scoped, unscoped } from '~/orpc';

export const paymentsRouter = {
  gateways: scoped.payments.gateways.handler(() => listGateways(db())),
  quickQrDistricts: scoped.payments.quickQrDistricts.handler(({ input }) =>
    listQuickQrDistricts(input.city),
  ),
  createInvoice: unscoped.payments.createInvoice.handler(({ input }) => createInvoice(input)),
  recordPayment: scoped.payments.recordPayment.handler(({ input }) => recordPayment(db(), input)),
  getInvoice: unscoped.payments.getInvoice.handler(({ input }) => getInvoice(input.id)),
  cancelInvoice: unscoped.payments.cancelInvoice.handler(({ input }) => cancelInvoice(input.id)),
  invoices: scoped.payments.invoices.handler(({ input }) => listInvoices(db(), input)),
  refund: scoped.payments.refund.handler(({ input }) => refundInvoice(db(), input)),
  refunds: scoped.payments.refunds.handler(({ input }) => listRefunds(db(), input.id)),
  settings: scoped.payments.settings.handler(() => paymentSettings(db())),
  saveSettings: scoped.payments.saveSettings.handler(({ input }) =>
    savePaymentSettings(db(), input),
  ),
  payTestInvoice: unscoped.payments.payTestInvoice.handler(({ input }) => payTestInvoice(input.id)),
};
