import { IContext } from '../../connectionResolver';
import { sendMessageBroker } from '../../messageBroker';
import { IInvoiceDocument } from '../../models/definitions/invoices';

const Invoices = {
  company(invoice: IInvoiceDocument, _, { subdomain }: IContext) {
    if (!invoice.companyId) return null;
    return sendMessageBroker(
      {
        subdomain,
        action: 'companies.findOne',
        data: { _id: invoice.companyId },
        isRPC: true
      },
      'contacts'
    );
  },

  customer(invoice: IInvoiceDocument, _, { subdomain }: IContext) {
    if (!invoice.customerId) return null;
    return sendMessageBroker(
      {
        subdomain,
        action: 'customers.findOne',
        data: { _id: invoice.customerId },
        isRPC: true
      },
      'contacts'
    );
  },

  contract(invoice: IInvoiceDocument, _, { models }: IContext) {
    return models.Contracts.findOne({ _id: invoice.contractId });
  },

  transaction(invoice: IInvoiceDocument, _, { models }: IContext) {
    return models.Transactions.findOne({ invoiceId: invoice._id });
  }
};

export default Invoices;
