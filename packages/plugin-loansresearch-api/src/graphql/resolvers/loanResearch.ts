import { IContext } from '../../connectionResolver';
import { sendCoreMessage, sendSalesMessage } from '../../messageBroker';
import { ILoanResearch } from '../../models/definitions/loansResearch';

const loanResearch = {
  async customer(contract: ILoanResearch, _, { subdomain }: IContext) {
    if (!contract.customerId) {
      return null;
    }

    return await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: contract.customerId },
      isRPC: true,
    });
  },

  async deal(contract: ILoanResearch, _, { subdomain }: IContext) {
    if (!contract.dealId) {
      return null;
    }

    return await sendSalesMessage({
      subdomain,
      action: 'deals.findOne',
      data: { _id: contract.dealId },
      isRPC: true,
    });
  },
};

export default loanResearch;
