import moment = require('moment');
import { DealBoards, DealPipelines, Deals, DealStages } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions';
import { dealsCommonFilter, getNextMonth, getToday, nextMonday, nextWeekdayDate } from './utils';
interface IDate {
  month: number;
  year: number;
}
interface IDealListParams {
  pipelineId?: string;
  stageId: string;
  skip?: number;
  date?: IDate;
  search?: string;
  customerIds?: [string];
  companyIds?: [string];
  assignedUserIds?: [string];
  productIds?: [string];
}

const contains = (values: string[] = [], empty = false) => {
  if (empty) {
    return [];
  }

  return { $in: values };
};

export const generateCommonFilters = (args: any) => {
  const {
    overdue,
    nextMonth,
    nextDay,
    nextWeek,
    noCloseDate,
    assignedUserIds,
    customerIds,
    companyIds,
    productIds,
  } = args;

  const filter: any = {};

  const assignedToNoOne = value => {
    return value.length === 1 && value[0].length === 0;
  };

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = assignedToNoOne(assignedUserIds);

    filter.assignedUserIds = notAssigned ? contains([], true) : contains(assignedUserIds);
  }

  if (customerIds) {
    filter.customerIds = contains(customerIds);
  }

  if (companyIds) {
    filter.companyIds = contains(companyIds);
  }

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  if (nextDay) {
    const tommorrow = moment().add(1, 'days');

    filter.closeDate = {
      $gte: tommorrow.startOf('day').toDate(),
      $lte: tommorrow.endOf('day').toDate(),
    };
  }

  if (nextWeek) {
    const monday = nextMonday();
    const nextSunday = nextWeekdayDate(8);

    filter.closeDate = {
      $gte: new Date(monday),
      $lte: new Date(nextSunday),
    };
  }

  if (nextMonth) {
    const date = new Date();
    const { start, end } = getNextMonth(date);

    filter.closeDate = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  if (noCloseDate) {
    filter.closeDate = { $exists: false };
  }

  if (overdue) {
    const date = new Date();
    const today = getToday(date);

    filter.closeDate = { $lt: today };
  }

  return filter;
};

const dateSelector = (date: IDate) => {
  const { year, month } = date;
  const currentDate = new Date();

  const start = currentDate.setFullYear(year, month, 1);
  const end = currentDate.setFullYear(year, month + 1, 0);

  return {
    $gte: new Date(start),
    $lte: new Date(end),
  };
};

const dealQueries = {
  /**
   * Deal Boards list
   */
  dealBoards() {
    return DealBoards.find({}).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal Board detail
   */
  dealBoardDetail(_root, { _id }: { _id: string }) {
    return DealBoards.findOne({ _id });
  },

  /**
   * Get last board
   */

  dealBoardGetLast() {
    return DealBoards.findOne().sort({ createdAt: -1 });
  },

  /**
   * Deal Pipelines list
   */

  dealPipelines(_root, { boardId }: { boardId: string }) {
    return DealPipelines.find({ boardId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal pipeline detail
   */
  dealPipelineDetail(_root, { _id }: { _id: string }) {
    return DealPipelines.findOne({ _id });
  },

  /**
   * Deal Stages list
   */
  dealStages(_root, { pipelineId }: { pipelineId: string }) {
    return DealStages.find({ pipelineId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   * Deal stage detail
   */
  dealStageDetail(_root, { _id }: { _id: string }) {
    return DealStages.findOne({ _id });
  },

  /**
   * Deals list
   */
  async deals(_root, args: IDealListParams) {
    const { pipelineId, stageId, date, skip, search } = args;

    const commonFilters = generateCommonFilters(args);
    const filter: any = dealsCommonFilter(commonFilters, { search });

    const sort = { order: 1, createdAt: -1 };

    if (stageId) {
      filter.stageId = stageId;
    }

    // Calendar monthly date
    if (date) {
      const stageIds = await DealStages.find({ pipelineId }).distinct('_id');

      filter.closeDate = dateSelector(date);
      filter.stageId = { $in: stageIds };
    }

    return Deals.find(filter)
      .sort(sort)
      .skip(skip || 0)
      .limit(10);
  },

  /**
   *  Deal total amounts
   */
  async dealsTotalAmounts(_root, { pipelineId, date, ...args }: { date: IDate; pipelineId: string }) {
    const stageIds = await DealStages.find({ pipelineId }).distinct('_id');
    const filter = generateCommonFilters(args);

    filter.stageId = { $in: stageIds };
    filter.closeDate = dateSelector(date);

    const dealCount = await Deals.find(filter).countDocuments();
    const amountList = await Deals.aggregate([
      {
        $match: filter,
      },
      {
        $unwind: '$productsData',
      },
      {
        $project: {
          amount: '$productsData.amount',
          currency: '$productsData.currency',
        },
      },
      {
        $group: {
          _id: '$currency',
          amount: { $sum: '$amount' },
        },
      },
    ]);

    const dealAmounts = amountList.map(deal => {
      return { _id: Math.random(), currency: deal._id, amount: deal.amount };
    });

    return { _id: Math.random(), dealCount, dealAmounts };
  },

  /**
   * Deal detail
   */
  dealDetail(_root, { _id }: { _id: string }) {
    return Deals.findOne({ _id });
  },
};

moduleRequireLogin(dealQueries);

checkPermission(dealQueries, 'deals', 'showDeals', []);

export default dealQueries;
