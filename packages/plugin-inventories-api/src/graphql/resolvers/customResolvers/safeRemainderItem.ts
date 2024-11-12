import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";
import { ISafeRemainderItemDocument } from "../../../models/definitions/safeRemainderItems";

export default {
  async product(
    safeRemainderItem: ISafeRemainderItemDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendCoreMessage({
      subdomain,
      action: "products.findOne",
      data: {
        _id: safeRemainderItem.productId
      },
      isRPC: true
    });
  }
};
