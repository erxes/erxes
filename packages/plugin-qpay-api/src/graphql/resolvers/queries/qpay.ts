import { paginate } from 'erxes-api-utils';
import {
  getQpayInvoice,
  qpayToken,
  checkQpayPayment,
  listQpayPayment,
  getQpayNuat,
  getQpayConfigs,
  getConfigs,
} from '../../../models/definitions/utils';

import {
  hmac256,
  socialPayInvoiceCheck,
  configCodes as configCodesSP,
} from '../../../models/definitions/utilsGolomtSP';

const Queries = {
  /**
   * check socialPay invoice
   */

  checkSPInvoice: async (_root, params, { models }) => {
    const configs = models.Configs;
    const invoiceNo = params.invoiceNo;
    const terminal = await getConfigs(configs, configCodesSP['terminal']);
    const keyIV = await getConfigs(configs, configCodesSP['key']);
    const invoice = await models.SocialPayInvoice.getSocialPayInvoice(
      models,
      invoiceNo
    );
    const amount = invoice.amount;
    const checksum = await hmac256(keyIV, terminal + invoiceNo + amount);

    const requestBody = {
      amount,
      checksum,
      invoice: invoiceNo,
      terminal,
    };
    const response = await socialPayInvoiceCheck(requestBody, configs);

    if (
      response &&
      response.header.code === 200 &&
      response.body.response.resp_desc &&
      response.body.response.resp_desc === 'Амжилттай'
    ) {
      await models.SocialPayInvoice.socialPayInvoiceStatusUpdate(
        models,
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
      perPage: params.perPage,
    });
  },

  /**
   * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   * * START QPAY QUERIES
   */

  getQpayAddresses: async (_root, params, { models }) => {
    const code = 'qpayAddressCode';
    return getQpayConfigs(code, models, params);
  },

  getQpaySenderBranchDatas: async (_root, params, { models }) => {
    const code = 'qpaySenderBranchDataCode';
    return getQpayConfigs(code, models, params);
  },

  getQpaySenderStaffDatas: async (_root, params, { models }) => {
    const code = 'qpaySenderStaffDataCode';
    return getQpayConfigs(code, models, params);
  },

  getQpayInvoiceReceiverDatas: async (_root, params, { models }) => {
    const code = 'qpayInvoiceReceiverDataCode';
    return getQpayConfigs(code, models, params);
  },
  getQPayDiscounts: async (_root, params, { models }) => {
    const code = 'qpayDiscountsCode';
    return getQpayConfigs(code, models, params);
  },

  getQpaySurcharges: async (_root, params, { models }) => {
    const code = 'qpaySurchargesCode';
    return getQpayConfigs(code, models, params);
  },

  getQpayTaxes: async (_root, params, { models }) => {
    const code = 'qpayTaxesCode';
    return getQpayConfigs(code, models, params);
  },

  getQpayLines: async (_root, params, { models }) => {
    const code = 'qpayLinesCode';
    return getQpayConfigs(code, models, params);
  },

  getQpayTransaction: async (_root, params, { models }) => {
    const code = 'qpayTransactionCode';
    return getQpayConfigs(code, models, params);
  },

  getQpayInvoiceDetails: async (_root, params, { models }) => {
    const configs = models.Configs;
    const token = await qpayToken(configs);

    const invoice = await models.QpayInvoice.findOne({
      qpayInvoiceId: params.invoiceId,
    });

    const detail = await getQpayInvoice(params.invoiceId, token, configs);

    if (
      invoice &&
      !invoice.qpayPaymentId &&
      detail.invoice_status === 'CLOSED'
    ) {
      const payments = detail.payments;

      payments.map(async (e) => {
        const paymentId = e.payment_id;

        await models.QpayInvoice.updateOne(
          { qpayInvoiceId: params.invoiceId },
          {
            $set: {
              paymentDate: new Date(),
              qpayPaymentId: paymentId,
              status: 'PAID',
            },
          }
        );
      });
    }

    return detail;
  },

  qpayInvoices: async (_root, params, { models }) => {
    return paginate(models.QpayInvoice.find().sort({ createdAt: -1 }), {
      page: params.page,
      perPage: params.perPage,
    });
  },

  checkQpayPayments: async (_root, params, { models }) => {
    const configs = models.Configs;
    const token = await qpayToken(configs);

    const page = params.page ? params.page : 1;
    const limit = params.limit ? params.limit : 100;

    const varData = {
      object_type: params.objectType,
      object_id: params.objectId,
      offset: {
        page_number: page,
        page_limit: limit,
      },
    };

    return await checkQpayPayment(varData, token, configs);
  },

  listQpayPayments: async (_root, params, { models }) => {
    const configs = models.Configs;
    const token = await qpayToken(configs);
    const {
      page,
      limit,
      objectType,
      objectId,
      merchant_branch_code,
      merchant_terminal_code,
      merchant_staff_code,
    } = params;

    const pageData = page ? page : 1;
    const limitData = limit ? limit : 100;

    let varData = {
      object_type: objectType,
      object_id: objectId,
      offset: {
        page_number: pageData,
        page_limit: limitData,
      },
    };
    varData = merchant_branch_code
      ? { ...varData, ...{ merchant_branch_code } }
      : merchant_terminal_code
      ? { ...varData, ...{ merchant_terminal_code } }
      : merchant_staff_code
      ? { ...varData, ...{ merchant_staff_code } }
      : varData;

    return await listQpayPayment(varData, token, configs);
  },

  getQpayNuat: async (_root, params, { models }) => {
    const configs = models.Configs;
    const token = await qpayToken(configs);
    const varData = {
      payment_id: params.paymentId,
      ebarimt_receiver_type: params.receiverType,
    };

    return await getQpayNuat(varData, token, configs);
  },
};

export default Queries;
