import { DealBoards, DealPipelines, Deals, DealStages } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions';
import { dealsCommonFilter } from './utils';
interface IDate {
  month: number;
  year: number;
}

interface IDealListParams {
  pipelineId?: string;
  stageId: string;
  customerId: string;
  companyId: string;
  skip?: number;
  date?: IDate;
  search?: string;
}

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
  async deals(_root, { pipelineId, stageId, customerId, companyId, date, skip, search }: IDealListParams) {
    const filter: any = dealsCommonFilter({}, { search });
    const sort = { order: 1, createdAt: -1 };

    if (stageId) {
      filter.stageId = stageId;
    }

    if (customerId) {
      filter.customerIds = { $in: [customerId] };
    }

    if (companyId) {
      filter.companyIds = { $in: [companyId] };
    }

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
  async dealsTotalAmounts(_root, { pipelineId, date }: { date: IDate; pipelineId: string }) {
    const stageIds = await DealStages.find({ pipelineId }).distinct('_id');
    const filter = { stageId: { $in: stageIds }, closeDate: dateSelector(date) };

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
