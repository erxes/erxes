import { IContext } from '../../../connectionResolver';
import { getFullDate } from '../../../models/utils/utils';

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
    const years = dates.map(item => getFullDate(item.payDate).getFullYear());
    const uniqueYears = [...new Set(years)];

    return uniqueYears.map(item => ({ year: item }));
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
        { payDate: { $lte: f_year } }
      ];
    }

    if (params.isFirst) {
      return models.FirstSchedules.find(filter).sort({ payDate: 1 });
    }

    return models.Schedules.find(filter).sort({ payDate: 1, createdAt: 1 });
  },
};

export default scheduleQueries;
