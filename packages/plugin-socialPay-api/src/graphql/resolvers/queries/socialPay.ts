import { paginate } from '@erxes/api-utils/src/core';
import {
  hmac256,
  socialPayInvoiceCheck,
  getConfig
} from '../../../utilsGolomtSP';

const Queries = {
  /**
   * check socialPay invoice
   */

  checkSPInvoice: async (_root, params, { models, subdomain }) => {
    const config = await getConfig(subdomain, 'SocialPAY');
    const invoiceNo = params.invoiceNo;
    const { inStoreSPTerminal, inStoreSPKey } = config;

    const invoice = await models.SocialPayInvoice.getSocialPayInvoice(
      models,
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
      perPage: params.perPage
    });
  }
};

export default Queries;
