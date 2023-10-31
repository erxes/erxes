import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

export default {
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
