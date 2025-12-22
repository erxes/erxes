import { IContext } from "../../../connectionResolver";
import { sendClientPortalMessage } from "../../../messageBroker";
import { getFullDate } from "../../../models/utils/utils";

const scheduleQueries = {
  scheduleYears: async (
    _root,
    params: { contractId: string },
    { models }: IContext
  ) => {
    const dates = await models.FirstSchedules.find(
      { contractId: params.contractId },
      { payDate: 1 }
    ).sort({ payDate: 1 });
    const years = dates.map((item) => getFullDate(item.payDate).getFullYear());
    const uniqueYears = [...new Set(years)];

    return uniqueYears.map((item) => ({ year: item }));
  },

  schedules: async (
    _root,
    params: { contractId: string; isFirst: boolean; year?: number },
    { models }: IContext
  ) => {
    let filter = { contractId: params.contractId } as any;
    if (params.year) {
      const b_year = new Date(params.year, 0, 1);
      const f_year = new Date(params.year + 1, 0, 1);
      filter.$and = [
        { payDate: { $gte: b_year } },
        { payDate: { $lte: f_year } },
      ];
    }

    if (params.isFirst) {
      return models.FirstSchedules.find(filter).sort({ payDate: 1 });
    }

    return models.Schedules.find(filter).sort({ payDate: 1, createdAt: 1 });
  },

  userSchedules: async (
    _root,
    params: { userId: string; contractIds?: string[] },
    { models, subdomain }: IContext
  ) => {
    const cpUser = await sendClientPortalMessage({
      subdomain,
      action: "clientPortalUsers.findOne",
      data: {
        $or: [{ _id: params.userId }, { erxesCustomerId: params.userId }],
      },
      isRPC: true,
      defaultValue: null,
    });

    if (!cpUser) {
      throw new Error("User not found");
    }

    const contracts = await models.Contracts.find({
      customerId: cpUser.erxesCustomerId,
      ...(params.contractIds ? { _id: { $in: params.contractIds } } : {}),
    }).lean();

    if (!contracts.length) {
      throw new Error("No contracts found for this user");
    }

    const filter = {
      contractId: { $in: contracts.map((contract) => contract._id) },
    };

    return models.Schedules.find(filter);
  },
};

export default scheduleQueries;
