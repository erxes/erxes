import { serviceDiscovery } from './../../configs';
import { IContext } from '../../connectionResolver';
import { IInvoice } from '../../models/definitions/invoices';
import { sendPluginsMessage } from '../../messageBroker';
import { PLUGIN_RESOLVERS_META } from '../../constants';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Invoices.findOne({ _id });
  },

  async customer(invoice: IInvoice) {
    return (
      invoice.customerId && { __typename: 'Customer', _id: invoice.customerId }
    );
  },

  async company(invoice: IInvoice) {
    return (
      invoice.companyId && { __typename: 'Company', _id: invoice.companyId }
    );
  },

  async payment(invoice: IInvoice, {}, { models }: IContext) {
    return (
      invoice.paymentId && models.Payments.findOne({ _id: invoice.paymentId })
    );
  },

  async pluginData(invoice: IInvoice, {}, { subdomain }: IContext) {
    const pluginName = invoice.contentType.split(':')[0];

    if (!(await serviceDiscovery.isEnabled(pluginName))) {
      return null;
    }

    const data: any = {};

    const meta = PLUGIN_RESOLVERS_META[invoice.contentType];

    data[meta.queryKey] = invoice.contentTypeId;

    return sendPluginsMessage(pluginName, {
      subdomain,
      action: meta.action,
      data,
      isRPC: true,
      defaultValue: null
    });
  }
};
