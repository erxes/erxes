import { IContext } from '../../../connectionResolver';

type InvoiceParams = {
  amount: number;
  phone: string;
  email: string;
  description: string;
  customerId: string;
  companyId: string;
  contentType: string;
  contentTypeId: string;
  paymentIds: string[];
  redirectUri: string;
};

const mutations = {
  async generateInvoiceUrl(_root, params: InvoiceParams, { models }: IContext) {
    const invoice = await models.Invoices.create(params);

    const MAIN_API_DOMAIN =
      process.env.MAIN_API_DOMAIN || 'http://localhost:4000';

    const base64 = Buffer.from(
      JSON.stringify({ _id: invoice._id, ...params })
    ).toString('base64');

    return `${MAIN_API_DOMAIN}/pl:payment/gateway?params=${base64}`;
  }
};

export default mutations;
