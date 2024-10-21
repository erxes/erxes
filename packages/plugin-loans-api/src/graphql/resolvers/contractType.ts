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
        action: 'findOne',
        data: { _id: contractType.productId || '' },
        isRPC: true,
        defaultValue: {}
      }, 'products'))
    );
  },
};

export default contractTypeResolvers;