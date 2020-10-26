import { EmailDeliveries } from '../../../db/models';
import { requireLogin } from '../../permissions/wrappers';
import { paginate } from '../../utils';

const emailDeliveryQueries = {
  emailDeliveryDetail(_root, { _id }: { _id: string }) {
    return EmailDeliveries.findOne({ _id });
  },

  async transactionEmailDeliveries(
    _root,
    { searchValue, ...params }: { searchValue: string; page: number; perPage: number },
  ) {
    const selector: any = { kind: 'transaction' };

    if (searchValue) {
      selector.$or = [
        { from: { $regex: new RegExp(searchValue) } },
        { subject: { $regex: new RegExp(searchValue) } },
        { to: { $regex: new RegExp(searchValue) } },
      ];
    }

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
