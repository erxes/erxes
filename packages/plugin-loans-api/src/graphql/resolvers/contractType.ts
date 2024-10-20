import { sendCoreMessage } from '../../messageBroker';
import { IContractTypeDocument } from '../../models/definitions/contractTypes';
import { IContext } from '../../connectionResolver';

const contractTypeResolvers = {
  async product(contractType: IContractTypeDocument, { }, { subdomain }: IContext) {
    if (!contractType.productId) {
      return;
    }
    return (
      (await sendCoreMessage({
        subdomain,
        action: 'products.findOne',
        data: { _id: contractType.productId || '' },
        isRPC: true,
        defaultValue: {}
      }))
    );
  },
};

export default contractTypeResolvers;
