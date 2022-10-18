import { IContext } from '../../../connectionResolver';
import { sendCoreMessage, sendProductsMessage } from '../../../messageBroker';
import { ITransactionDocument } from '../../../models/definitions/transactions';

export default {
  async department(
    transaction: ITransactionDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendCoreMessage({
      subdomain,
      action: 'departments.findOne',
      data: {
        _id: transaction.departmentId
      },
      isRPC: true
    });
  },

  async branch(transaction: ITransactionDocument, _, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: {
        _id: transaction.branchId
      },
      isRPC: true
    });
  },

  async transactionItems_product(transaction: any, _, { subdomain }: IContext) {
    const result: any = [];

    transaction.transactionItems.map((item: any) => {
      result.push(
        sendProductsMessage({
          subdomain,
          action: 'findOne',
          data: {
            _id: item.productId
          },
          isRPC: true
        })
      );
    });

    return result;
  }
};
