import { getEnv } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { makeInvoiceNo } from '../../../utils';

type InvoiceParams = {
  amount: number;
  phone: string;
  email: string;
  description: string;
  customerId: string;
  customerType: string;
  contentType: string;
  contentTypeId: string;
  paymentIds: string[];
  redirectUri: string;
  warningText: string;
};

const mutations = {
  async generateInvoiceUrl(
    _root,
    params: InvoiceParams,
    { models, requestInfo, res, subdomain }: IContext
  ) {
    const domain = getEnv({ name: 'DOMAIN', subdomain })
      ? `${getEnv({ name: 'DOMAIN', subdomain })}/gateway`
      : 'http://localhost:4000';

    const cookies = requestInfo.cookies;

    const paymentCookies = Object.keys(cookies).filter(key =>
      key.includes('paymentData')
    );

    for (const cookie of paymentCookies) {
      const contentTypeId = cookie.split('_')[1];
      if (contentTypeId === params.contentTypeId) {
        const dataInCookie = cookies[cookie];

        const paymentData =
          dataInCookie &&
          JSON.parse(
            Buffer.from(dataInCookie as string, 'base64').toString('ascii')
          );

        if (
          dataInCookie &&
          paymentData.amount === params.amount &&
          paymentData.customerId === params.customerId
        ) {
          return `${domain}/pl:payment/gateway?params=${dataInCookie}`;
        }
      }
    }

    const invoice = await models.Invoices.create({
      ...params,
      identifier: makeInvoiceNo(32)
    });

    const base64 = Buffer.from(
      JSON.stringify({ _id: invoice._id, ...params })
    ).toString('base64');

    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    const secure = !['test', 'development'].includes(NODE_ENV);

    const maxAge = 10 * 60000;

    const cookieOptions: any = {
      maxAge,
      expires: new Date(Date.now() + maxAge),
      sameSite: 'none',
      secure: requestInfo.secure
    };

    if (!secure && cookieOptions.sameSite) {
      delete cookieOptions.sameSite;
    }

    res.cookie(`paymentData_${params.contentTypeId}`, base64, cookieOptions);

    return `${domain}/pl:payment/gateway?params=${base64}`;
  }
};

export default mutations;
