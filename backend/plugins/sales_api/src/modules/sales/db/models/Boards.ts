import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IBoard, IBoardDocument } from '../../@types';
import { boardSchema } from '../definitions/boards';
import { removePipelineStagesWithItems } from '~/modules/sales/graphql/resolvers/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { generateBoardActivityLogs } from '~/utils/activityLogs';

export interface IBoardModel extends Model<IBoardDocument> {
  getBoard(_id: string): Promise<IBoardDocument>;
  createBoard(doc: IBoard, userId?: string): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard, userId?: string): Promise<IBoardDocument>;
  removeBoard(_id: string): Promise<IBoardDocument>;
  updateTimeTracking(
    _id: string,
    status: string,
    timeSpent: number,
    startDate: string,
  ): Promise<any>;
}

export const loadBoardClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog, createActivityLog }: EventDispatcherReturn,
) => {
  class Board {
    public static async getBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      return board;
    }

    public static async createBoard(doc: IBoard, userId?: string) {
      const board = await models.Boards.create({
        ...doc,
        userId,
        type: doc.type || 'deal',
      });

      // Send database event log
      sendDbEventLog({
        action: 'create',
        docId: board._id,
        currentDocument: board.toObject(),
      });

      // Create activity log
      createActivityLog({
        activityType: 'create',
        target: {
          _id: board._id,
          moduleName: 'sales',
          collectionName: 'boards',
        },
        action: {
          type: 'create',
          description: 'Board created',
        },
        changes: {
          name: board.name,
          type: board.type,
          createdAt: new Date(),
        },
        metadata: {
          userId,
        },
      });

      return board;
    }

    public static async updateBoard(_id: string, doc: IBoard, userId?: string) {
      const prevBoard = await models.Boards.findOne({ _id });

      if (!prevBoard) {
        throw new Error('Board not found');
      }

      await models.Boards.updateOne(
        { _id },
        { $set: { ...doc, userId } },
      );

      const updatedBoard = await models.Boards.findOne({ _id });

      if (!updatedBoard) {
         throw new Error('Board not found');
      }

      if (updatedBoard) {
        // Send database event log
        sendDbEventLog({
          action: 'update',
          docId: updatedBoard._id,
          currentDocument: updatedBoard.toObject(),
          prevDocument: prevBoard.toObject(),
        });

        // Generate activity logs for changed fields
        await generateBoardActivityLogs(
          prevBoard.toObject(),
          updatedBoard.toObject(),
          models,
          createActivityLog,
        );
      }

      return updatedBoard;
    }

    public static async removeBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });

      if (!board) {
        throw new Error('Board not found');
      }

      // Send database event log before deletion
      sendDbEventLog({
        action: 'delete',
        docId: board._id,
      });

      // Create activity log
      createActivityLog({
        activityType: 'delete',
        target: {
          _id: board._id,
          moduleName: 'sales',
          collectionName: 'boards',
        },
        action: {
          type: 'delete',
          description: 'Board deleted',
        },
        changes: {
          name: board.name,
          deletedAt: new Date(),
        },
        metadata: {
          userId: board.userId,
        },
      });

      const pipelines = await models.Pipelines.find({ boardId: _id });

      for (const pipeline of pipelines) {
        await removePipelineStagesWithItems(models, pipeline._id);
      }

      for (const pipeline of pipelines) {
        await models.Pipelines.removePipeline(pipeline._id, true);
      }

      await models.Boards.deleteOne({ _id });

      return board;
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