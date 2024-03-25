import { IContext } from '../../connectionResolver';
import { sendCommonMessage, sendContactsMessage } from '../../messageBroker';
import { IInvoice, IInvoiceDocument } from '../../models/definitions/invoices';
import { ITransactionDocument } from '../../models/definitions/transactions';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Transactions.findOne({ _id });
  },

  async invoice(transaction: ITransactionDocument, {}, { models }: IContext) {
    return (
      transaction.invoiceId && {
        __typename: 'Invoice',
        _id: transaction.invoiceId,
      }
    );
  },
};
