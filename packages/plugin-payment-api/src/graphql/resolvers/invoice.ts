import { serviceDiscovery } from './../../configs';
import { IContext } from '../../connectionResolver';
import { IInvoice } from '../../models/definitions/invoices';
import { sendMessage } from '@erxes/api-utils/src/core';
import { sendPluginsMessage } from '../../messageBroker';

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

  async paymentConfig(invoice: IInvoice, {}, { models }: IContext) {
    return (
      invoice.paymentConfigId &&
      models.PaymentConfigs.findOne({ _id: invoice.paymentConfigId })
    );
  },

  async pluginData(invoice: IInvoice, {}, { subdomain }: IContext) {
    const pluginName = invoice.contentType.split(':')[0];
    const collection = invoice.contentType.split(':')[1]
      ? invoice.contentType.split(':')[1]
      : pluginName;

    if (!(await serviceDiscovery.isEnabled(pluginName))) {
      return null;
    }

    return sendPluginsMessage(pluginName, {
      subdomain,
      action: `${collection}.findOne`,
      data: {
        _id: invoice.contentTypeId
      },
      isRPC: true,
      defaultValue: null
    });
  }
};
