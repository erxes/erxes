import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";

export default {
  async transactionItems_product(transaction: any, _, { subdomain }: IContext) {
    const result: any = [];

    transaction.transactionItems.map((item: any) => {
      result.push(
        sendCoreMessage({
          subdomain,
          action: "products.findOne",
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
