import { serviceDiscovery } from './../../configs';
import { IContext } from '../../connectionResolver';
import { IInvoice } from '../../models/definitions/invoices';
import { sendCommonMessage, sendContactsMessage } from '../../messageBroker';
import { PLUGIN_RESOLVERS_META } from '../../api/constants';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Invoices.findOne({ _id });
  },

  async customer(invoice: IInvoice, {}, { subdomain }: IContext) {
    switch (invoice.customerType) {
      case 'company':
        const company = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: { _id: invoice.customerId },
          isRPC: true,
          defaultValue: null
        });

        if (!company) {
          return null;
        }

        return {
          name: company.primaryName,
          email: company.primaryEmail,
          phone: company.primaryPhone
        };
      case 'customer':
        const customer = await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: { _id: invoice.customerId },
          isRPC: true,
          defaultValue: null
        });

        if (!customer) {
          return null;
        }

        return {
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.primaryEmail,
          phone: customer.primaryPhone
        };
      case 'user':
        const user = await sendCommonMessage('core', {
          subdomain,
          action: 'users.findOne',
          data: { _id: invoice.customerId },
          isRPC: true,
          defaultValue: null
        });

        if (!user) {
          return null;
        }

        return { name: user.username, email: user.email, phone: '' };
      default:
        return null;
    }
  },

  async payment(invoice: IInvoice, {}, { models }: IContext) {
    return (
      invoice.selectedPaymentId &&
      (await models.Payments.findOne({ _id: invoice.selectedPaymentId }).lean())
    );
  },

  async pluginData(invoice: IInvoice, {}, { subdomain }: IContext) {
    const [pluginName, collectionName] = invoice.contentType.split(':');

    if (!(await serviceDiscovery.isEnabled(pluginName))) {
      return null;
    }

    const data: any = {};

    const meta = PLUGIN_RESOLVERS_META[invoice.contentType];

    if (!meta) {
      return await sendCommonMessage(pluginName, {
        subdomain,
        action: `${collectionName}.findOne`,
        data: { _id: invoice.contentTypeId },
        isRPC: true,
        defaultValue: null
      });
    }

    data[meta.queryKey] = invoice.contentTypeId;

    return sendCommonMessage(pluginName, {
      subdomain,
      action: meta.action,
      data,
      isRPC: true,
      defaultValue: null
    });
  }
};
