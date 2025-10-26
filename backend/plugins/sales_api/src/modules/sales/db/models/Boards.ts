import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IBoard, IBoardDocument } from '../../@types';

import { boardSchema } from '../definitions/boards';
import { removePipelineStagesWithItems } from '~/modules/sales/graphql/resolvers/utils';

export interface IBoardModel extends Model<IBoardDocument> {
  getBoard(_id: string): Promise<IBoardDocument>;
  createBoard(doc: IBoard): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard): Promise<IBoardDocument>;
  removeBoard(_id: string): object;
  updateTimeTracking(
    _id: string,
    status: string,
    timeSpent: number,
    startDate: string,
  ): Promise<any>;
}

export const loadBoardClass = (models: IModels) => {
  class Board {
    /*
     * Get a Board
     */
    public static async getBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      return board;
    }

    /**
     * Create a board
     */
    public static async createBoard(doc: IBoard) {
      return models.Boards.create(doc);
    }

    /**
     * Update Board
     */
    public static async updateBoard(_id: string, doc: IBoard) {
      await models.Boards.updateOne({ _id }, { $set: doc });

      return models.Boards.findOne({ _id });
    }

    /**
     * Remove Board
     */
    public static async removeBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      const pipelines = await models.Pipelines.find({ boardId: _id });

      for (const pipeline of pipelines) {
        await removePipelineStagesWithItems(models, pipeline._id);
      }

      for (const pipeline of pipelines) {
        await models.Pipelines.removePipeline(pipeline._id, true);
      }

      return models.Boards.deleteOne({ _id });
    }

    public static async updateTimeTracking(
      _id: string,
      status: string,
      timeSpent: number,
      startDate?: string,
    ) {
      const doc: { status: string; timeSpent: number; startDate?: string } = {
        status,
        timeSpent,
      };

      if (startDate) {
        doc.startDate = startDate;
      }

      await models.Deals.updateOne({ _id }, { $set: { timeTrack: doc } });

      return models.Deals.findOne({ _id }).lean();
    }
  }

  boardSchema.loadClass(Board);

  return boardSchema;
};
