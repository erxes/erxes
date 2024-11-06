import { sendMessageBroker } from '../../messageBroker';
import { IContractTypeDocument } from '../../models/definitions/contractTypes';
import { IContext } from '../../connectionResolver';

const contractTypeResolvers = {
  async product(contractType: IContractTypeDocument, { }, { subdomain }: IContext) {
    if (!contractType.productId) {
      return;
    }
    return (
      (await sendMessageBroker({
        subdomain,
        action: 'products.findOne',
        data: { _id: contractType.productId || '' },
        isRPC: true,
        defaultValue: {}
      }, 'core'))
    );
  },
};

export default contractTypeResolvers;