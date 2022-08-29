import { paginate } from '@erxes/api-utils/src/core';
import {
  getQpayInvoice,
  qpayToken,
  checkQpayPayment,
  listQpayPayment,
  getQpayNuat,
  getConfig
} from '../../../utils';

import { hmac256, socialPayInvoiceCheck } from '../../../utilsGolomtSP';

const Queries = {
  /**
   * check socialPay invoice
   */

  checkSPInvoice: async (_root, params, { models, subdomain }) => {
    const config = await getConfig(subdomain, 'SocialPAY');
    const invoiceNo = params.invoiceNo;
    const { inStoreSPTerminal, inStoreSPKey } = config;

    const invoice = await models.SocialPayInvoice.getSocialPayInvoice(
      invoiceNo
    );
    const amount = invoice.amount;
    const checksum = await hmac256(
      inStoreSPKey,
      inStoreSPTerminal + invoiceNo + amount
    );

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      terminal: inStoreSPTerminal
    };
    const response = await socialPayInvoiceCheck(requestBody, config);

    if (
      response &&
      response.header.code === 200 &&
      response.body.response.resp_desc &&
      response.body.response.resp_desc === 'Амжилттай'
    ) {
      await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(
        invoice,
        'paid'
      );
    }

    return response;
  },

  /**
   * get socialPay invoice logs
   */

  socialPayInvoices: async (_root, params, { models }) => {
    return paginate(models.SocialPayInvoice.find().sort({ createdAt: -1 }), {
      page: params.page,
      perPage: params.perPage
    });
  },

  /**
   * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   */

  getQpayInvoiceDetails: async (_root, params, { subdomain, models }) => {
    const config = await getConfig(subdomain, 'QPAY');
    const token = await qpayToken(config);

    const invoice = await models.QpayInvoice.findOne({
      qpayInvoiceId: params.invoiceId
    });

    const detail = await getQpayInvoice(params.invoiceId, token, config);

    if (
      invoice &&
      !invoice.qpayPaymentId &&
      detail.invoice_status === 'CLOSED'
    ) {
      const payments = detail.payments;

      payments.map(async e => {
        const paymentId = e.payment_id;

        await models.QpayInvoice.updateOne(
          { qpayInvoiceId: params.invoiceId },
          {
            $set: {
              paymentDate: new Date(),
              qpayPaymentId: paymentId,
              status: 'PAID'
            }
          }
        );
      });
    }

    return detail;
  },

  qpayInvoices: async (_root, params, { models }) => {
    return paginate(models.QpayInvoice.find().sort({ createdAt: -1 }), {
      page: params.page,
      perPage: params.perPage
    });
  },

  checkQpayPayments: async (_root, params, { subdomain }) => {
    const config = await getConfig(subdomain, 'SocialPAY');
    const token = await qpayToken(config);

    const page = params.page ? params.page : 1;
    const limit = params.limit ? params.limit : 100;

    const varData = {
      object_type: params.objectType,
      object_id: params.objectId,
      offset: {
        page_number: page,
        page_limit: limit
      }
    };

    return await checkQpayPayment(varData, token, config);
  },

  listQpayPayments: async (_root, params, { subdomain }) => {
    const config = await getConfig(subdomain, 'SocialPAY');
    const token = await qpayToken(config);
    const {
      page,
      limit,
      objectType,
      objectId,
      merchant_branch_code,
      merchant_terminal_code,
      merchant_staff_code
    } = params;

    const pageData = page ? page : 1;
    const limitData = limit ? limit : 100;

    let varData = {
      object_type: objectType,
      object_id: objectId,
      offset: {
        page_number: pageData,
        page_limit: limitData
      }
    };
    varData = merchant_branch_code
      ? { ...varData, ...{ merchant_branch_code } }
      : merchant_terminal_code
      ? { ...varData, ...{ merchant_terminal_code } }
      : merchant_staff_code
      ? { ...varData, ...{ merchant_staff_code } }
      : varData;

    return await listQpayPayment(varData, token, config);
  },

  getQpayNuat: async (_root, params, { subdomain }) => {
    const config = await getConfig(subdomain, 'SocialPAY');
    const token = await qpayToken(config);
    const varData = {
      payment_id: params.paymentId,
      ebarimt_receiver_type: params.receiverType
    };

    return await getQpayNuat(varData, token, config);
  }
};

export default Queries;
