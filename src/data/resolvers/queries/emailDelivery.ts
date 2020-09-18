import { EmailDeliveries } from '../../../db/models';
import { requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

const emailDeliveryQueries = {
  emailDeliveryDetail(_root, { _id }: { _id: string }) {
    return EmailDeliveries.findOne({ _id });
  },

  async transactionEmailDeliveries(_root, params: { page: number; perPage: number }) {
    const selector = { kind: 'transaction' };

    const totalCount = await EmailDeliveries.countDocuments(selector);

    return {
      list: paginate(EmailDeliveries.find(selector), params).sort({ createdAt: -1 }),
      totalCount,
    };
  },
};

requireLogin(emailDeliveryQueries, 'emailDeliveryDetail');
requireLogin(emailDeliveryQueries, 'transactionEmailDeliveries');

export default emailDeliveryQueries;
