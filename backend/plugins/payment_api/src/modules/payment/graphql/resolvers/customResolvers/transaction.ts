import { IContext } from '~/connectionResolvers';
import { ITransactionDocument } from '~/modules/payment/@types/transactions';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Transactions.findOne({ _id });
  },

  async invoice(transaction: ITransactionDocument) {
    return (
      transaction.invoiceId && {
        __typename: 'Invoice',
        _id: transaction.invoiceId,
      }
    );
  },

  async payment(transaction: ITransactionDocument, _args, { models }: IContext) {
    return await models.PaymentMethods.findOne({ _id: transaction.paymentId });
  },
};
