import { Boards, Pipelines, Stages } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

export interface IDate {
  month: number;
  year: number;
}

export interface IListParams {
  pipelineId?: string;
  stageId: string;
  skip?: number;
  date?: IDate;
  search?: string;
  customerIds?: [string];
  companyIds?: [string];
  assignedUserIds?: [string];
}

const boardQueries = {
  /**
   *  Boards list
   */
  boards(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    return Boards.find({ ...commonQuerySelector, type }).sort({ order: 1, createdAt: -1 });
  },

  /**
   *  Board detail
   */
  boardDetail(_root, { _id }: { _id: string }, { commonQuerySelector }: IContext) {
    return Boards.findOne({ ...commonQuerySelector, _id });
  },

  /**
   * Get last board
   */
  boardGetLast(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    return Boards.findOne({ ...commonQuerySelector, type }).sort({ createdAt: -1 });
  },

  /**
   *  Pipelines list
   */
  pipelines(_root, { boardId }: { boardId: string; type: string }) {
    return Pipelines.find({ boardId }).sort({ order: 1, createdAt: -1 });
  },

  /**
   *  Pipeline detail
   */
  pipelineDetail(_root, { _id }: { _id: string }) {
    return Pipelines.findOne({ _id });
  },

  /**
   *  Stages list
   */
  stages(_root, { pipelineId, isNotLost }: { pipelineId: string; isNotLost: boolean }) {
    const filter: any = {};

    filter.pipelineId = pipelineId;

    if (isNotLost) {
      filter.probability = { $ne: 'Lost' };
    }

    return Stages.find(filter).sort({ order: 1, createdAt: -1 });
  },

  /**
   *  Stage detail
   */
  stageDetail(_root, { _id }: { _id: string }) {
    return Stages.findOne({ _id });
  },
};

moduleRequireLogin(boardQueries);

export default boardQueries;
