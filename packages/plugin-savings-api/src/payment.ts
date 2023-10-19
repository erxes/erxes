import { generateModels } from './connectionResolver';
import * as moment from 'moment';
import { TRANSACTION_TYPE } from './models/definitions/constants';

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    switch (data.contentType) {
      case 'savings:contracts':
        const contract = await models.Contracts.findOne({
          _id: data.contentTypeId
        });

        //if contract found create transaction
        if (contract) {
          await models.Transactions.createTransaction(subdomain, {
            transactionType: TRANSACTION_TYPE.INCOME,
            currency: contract.currency,
            payDate: data.resolvedAt || new Date(),
            total: data.amount,
            payment: data.amount,
            contractId: contract._id,
            customerId: contract?.customerId,
            description: `Payment received from customer via ${
              data.paymentKind
            } at ${moment(data.resolvedAt).format('YYYY-MM-DD HH:mm:ss')}`
          });
        }
        break;

      default:
        break;
    }
  }
};
