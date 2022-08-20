import { IContext } from '../../types';
import {
  fetchQPayToken,
  requestQPayInvoice,
  fetchInvoicePayment,
  requestInvoiceDeletion
} from '../../utils/qpayUtils';

import { checkInvoiceAmount, commonCheckPayment } from '../../utils/orderUtils';

interface IInvoiceParams {
  orderId: string;
  amount: number;
  _id: string;
}

const INVOICE_STATUSES = {
  PAID: 'PAID',
  OPEN: 'open'
};

const paymentMutations = {
  async poscCreateQpaySimpleInvoice(
    _root,
    params: IInvoiceParams,
    { models, config }: IContext
  ) {
    if (!config.qpayConfig) {
      throw new Error('QPay config missing');
    }

    try {
      const { orderId, amount } = params;

      const order = await models.Orders.getOrder(orderId);

      await checkInvoiceAmount({ order, amount, models });

      const tokenInfo = await fetchQPayToken(config.qpayConfig);

      const invoiceData = await requestQPayInvoice(
        {
          invoice_code: config.qpayConfig.invoiceCode,
          sender_invoice_no: order._id,
          invoice_receiver_code: 'terminal',
          invoice_description: order.number,
          amount: amount ? amount : order.totalAmount,
          callback_url: `${config.qpayConfig.callbackUrl}?payment_id=${order._id}`
        },
        tokenInfo.access_token,
        config.qpayConfig
      );

      const invoice = await models.QPayInvoices.createInvoice({
        senderInvoiceNo: order._id,
        amount: amount ? amount.toString() : order.totalAmount.toString(),
        token: config.token
      });

      if (invoiceData) {
        await models.QPayInvoices.updateInvoice(invoice._id, invoiceData);
      }

      return models.QPayInvoices.findOne({ _id: invoice._id });
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async qpayCancelInvoice(
    _root,
    { orderId, _id }: IInvoiceParams,
    { models, config }: IContext
  ) {
    try {
      const tokenInfo = await fetchQPayToken(config.qpayConfig!);

      const order = models.Orders.findOne({ _id: orderId });
      let invoice;

      if (!order && _id) {
        invoice = await models.QPayInvoices.findOne({ _id });
      } else {
        invoice = await models.QPayInvoices.findOne({
          senderInvoiceNo: orderId
        });
      }

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.status === INVOICE_STATUSES.PAID) {
        throw new Error('Can not cancel paid invoice');
      }

      if (config.qpayConfig && invoice.status === INVOICE_STATUSES.OPEN) {
        const response = await requestInvoiceDeletion(
          invoice.qpayInvoiceId!,
          tokenInfo.access_token,
          config.qpayConfig
        );

        if (JSON.stringify(response) === '{}') {
          // successful cancel
          await models.QPayInvoices.deleteOne({ _id });
        }

        return 'success';
      }
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async qpayCheckPayment(
    _root,
    { orderId, _id }: IInvoiceParams,
    { models, config, subdomain }: IContext
  ) {
    let invoice;
    const order = await models.Orders.findOne({ _id: orderId }).lean();

    if (!order && _id) {
      invoice = await models.QPayInvoices.findOne({ _id }).lean();
    } else {
      invoice = await models.QPayInvoices.findOne({
        senderInvoiceNo: orderId
      }).lean();
    }

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (
      !config.qpayConfig ||
      (invoice.status === INVOICE_STATUSES.PAID &&
        invoice.qpayPaymentId &&
        invoice.paymentDate)
    ) {
      return invoice;
    }

    const tokenInfo = await fetchQPayToken(config.qpayConfig);
    const response = await fetchInvoicePayment(
      invoice.qpayInvoiceId!,
      tokenInfo.access_token,
      config.qpayConfig
    );

    // check payment info

    const { rows = [], count = 0 } = response;

    if (count && rows.length > 0) {
      const row = rows.find(
        r => r.payment_status === INVOICE_STATUSES.PAID && r.payment_id
      );

      if (
        row &&
        invoice.status !== INVOICE_STATUSES.PAID &&
        !invoice.qpayPaymentId
      ) {
        await models.QPayInvoices.updateOne(
          { _id: invoice._id },
          {
            $set: {
              qpayPaymentId: row.payment_id,
              paymentDate: row.payment_date || new Date(),
              status: row.payment_status
            }
          }
        );
        const orderId: any = invoice.senderInvoiceNo;

        const paidMobileAmount = await models.QPayInvoices.getPaidAmount(
          orderId
        );

        await models.Orders.updateOne(
          { _id: invoice.senderInvoiceNo },
          {
            $set: { mobileAmount: paidMobileAmount }
          }
        );

        const { SKIP_REDIS } = process.env;
        if (!SKIP_REDIS) {
          await commonCheckPayment(
            subdomain,
            models,
            orderId,
            config,
            paidMobileAmount
          );
        }

        return models.QPayInvoices.findOne({ _id: invoice._id }).lean();
      }
    }

    return models.QPayInvoices.findOne({ _id: invoice._id }).lean();
  }
};

export default paymentMutations;
