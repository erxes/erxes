import { skip } from "node:test";
import { IContext } from "../../../connectionResolver";

const orderQueries = {
  async bmOrders(
    _root,
    {
      tourId,
      customerId,
      page = 1,
      perPage = 10,
      status,
      branchId,
      sortField = "createdAt",
      sortDirection = -1,
    },
    { models }: IContext
  ) {
    const selector: any = {};
    if (tourId) {
      selector.tourId = tourId;
    }
    if (customerId) {
      selector.customerId = customerId;
    }
    if (branchId) {
      selector.branchId = branchId;
    }
    if (status) {
      selector.status = status;
    }
    const skip = Math.max(0, page - 1) * perPage;

    const list = await models.Orders.find(selector)
      .limit(perPage)
      .skip(skip)
      .sort({ [sortField]: sortDirection === -1 ? sortDirection : 1 });
    // const total = await models.Tours.countDocuments();
    const total = await models.Orders.find(selector).countDocuments();

    return {
      list,
      total: total,
    };
  },
};

export default orderQueries;
