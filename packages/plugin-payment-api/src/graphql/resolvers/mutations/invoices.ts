import { checkPermission, getEnv, requireLogin } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import { sendMessage } from '@erxes/api-utils/src/messageBroker';
import { IInvoice } from '../../../models/definitions/invoices';

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
  data?: any;
};

const mutations = {
  async generateInvoiceUrl(
    _root,
    params: IInvoice,
    { models, subdomain }: IContext
  ) {
    const domain = getEnv({ name: 'DOMAIN', subdomain })
      ? `${getEnv({ name: 'DOMAIN', subdomain })}/gateway`
      : 'http://localhost:4000';

    const invoice = await models.Invoices.createInvoice({
      ...params,
    });

    return `${domain}/pl:payment/invoice/${invoice._id}`;
  },

  async invoiceCreate(
    _root,
    params: IInvoice,
    { models, subdomain }: IContext
  ) {
    const invoice = await models.Invoices.createInvoice(
      {
        ...params,
      },
      subdomain
    );
    return invoice;
  },

  async invoicesCheck(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext
  ) {
    const status = await models.Invoices.checkInvoice(_id);

    if (status === 'paid') {
      const invoice = await models.Invoices.getInvoice({ _id });
      const [serviceName] = invoice.contentType.split(':');

      sendMessage(`${serviceName}:paymentCallback`, {
        subdomain,
        data: {
          ...invoice,
          status: 'paid',
        },
      });

      if (invoice.callback) {
        try {
          await fetch(invoice.callback, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              _id: invoice._id,
              amount: invoice.amount,
              status: 'paid',
            }),
          });
        } catch (e) {
          console.error('Error: ', e);
        }
      }
    }

    return status;
  },

  async invoicesRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.Invoices.removeInvoices(_ids);
  },

  async invoiceUpdate(
    _root,
    { _id, paymentId }: { _id: string; paymentId: string },
    { models, subdomain }: IContext
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN' })
      ? `${getEnv({ name: 'DOMAIN' })}/gateway`
      : 'http://localhost:4000';
    const domain = DOMAIN.replace('<subdomain>', subdomain);

    return models.Invoices.updateInvoice(_id, {
      selectedPaymentId: paymentId,
      domain,
    });
  },
};

requireLogin(mutations, 'invoiceCreate');

checkPermission(mutations, 'invoiceCreate', 'createInvoice');

export default mutations;
