import { SCHEDULE_STATUS } from '../../../models/definitions/constants';
import { IDefaultScheduleParam } from '../../../models/definitions/schedules';
import { calcPerVirtual, getFullDate } from '../../../models/utils/utils';

const scheduleQueries = {
  scheduleYears: async (_root, params: { contractId: string }, { models }) => {
    const dates = await models.RepaymentSchedules.find(
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
    { models }
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

    return models.Schedules.find(filter).sort({ payDate: 1 });
  },

  virtualSchedules: async (_root, doc: IDefaultScheduleParam, {}) => {
    const result: {
      index: Number;
      loanBalance: Number;
      loanPayment: Number;
      calcedInterest: Number;
      totalPayment: Number;
    }[] = [];
    if (doc.repayment === 'equal') {
      let balance = doc.leaseAmount;

      for (let i = 1; i < doc.tenor; i++) {
        const perMonth = await calcPerVirtual({ ...doc, leaseAmount: balance });
        balance = perMonth.loanBalance;
        result.push({ ...perMonth, index: i });
      }
    }
  },

  cpSchedules: async (
    _root,
    params: { contractId: string; status: string },
    { models }
  ) => {
    if (params.status === 'done')
      return models.Schedules.find({
        contractId: params.contractId,
        status: { $in: [SCHEDULE_STATUS.DONE, SCHEDULE_STATUS.LESS] }
      }).sort({ payDate: 1 });

    if (params.status === 'pending')
      return models.Schedules.find({
        contractId: params.contractId,
        status: { $in: [SCHEDULE_STATUS.PENDING, SCHEDULE_STATUS.LESS] }
      }).sort({ payDate: 1 });

    return models.Schedules.find({
      contractId: params.contractId
    }).sort({ payDate: 1 });
  }
};

export default scheduleQueries;
