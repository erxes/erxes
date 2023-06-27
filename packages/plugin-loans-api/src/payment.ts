import { generateModels } from './connectionResolver';
import * as moment from 'moment';

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    switch (data.contentType) {
      case 'loans:contracts':
        const contract = await models.Contracts.findOne({
          _id: data.contentTypeId
        });
        if (contract) {
          await models.Transactions.createTransaction(subdomain, {
            payDate: data.resolvedAt,
            total: data.amount,
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
