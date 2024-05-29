import { paginate, requireLogin } from "@erxes/api-utils/src";
import { IContext } from "../../connectionResolver";

const emailDeliveryQueries = {
  emailDeliveryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.EmailDeliveries.findOne({ _id });
  },

  async transactionEmailDeliveries(
    _root,
    {
      searchValue,
      ...params
    }: { searchValue: string; page: number; perPage: number },
    { models }: IContext
  ) {
    const selector: any = { kind: 'transaction' };

    if (searchValue) {
      selector.$or = [
        { from: { $regex: new RegExp(searchValue) } },
        { subject: { $regex: new RegExp(searchValue) } },
        { to: { $regex: new RegExp(searchValue) } }
      ];
    }

    const totalCount = await models.EmailDeliveries.countDocuments(selector);

    return {
      list: paginate(models.EmailDeliveries.find(selector), params).sort({
        createdAt: -1
      }),
      totalCount
    };
  },
  async emailDeliveriesAsLogs(_root, { contentId }: { contentId: string}, { models }: IContext) {
    const deliveries = await models.EmailDeliveries.find({ customerId: contentId }).lean();

    return deliveries.map(d => ({
      ...d,
      contentType: 'email',
      contentId,
    }));
  }
};

requireLogin(emailDeliveryQueries, 'emailDeliveryDetail');
requireLogin(emailDeliveryQueries, 'transactionEmailDeliveries');
requireLogin(emailDeliveryQueries, 'emailDeliveriesAsLogs');

export default emailDeliveryQueries;
