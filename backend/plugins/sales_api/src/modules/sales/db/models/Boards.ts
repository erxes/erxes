import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IBoard, IBoardDocument } from '../../@types';
import { boardSchema } from '../definitions/boards';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';


export interface IBoardModel extends Model<IBoardDocument> {
  getBoard(_id: string): Promise<IBoardDocument>;
  createBoard(doc: IBoard, userId?: string): Promise<IBoardDocument>;
  updateBoard(_id: string, doc: IBoard, userId?: string): Promise<IBoardDocument>;
  removeBoard(_id: string): Promise<IBoardDocument>;
  updateTimeTracking(
    _id: string,
    status: string,
    timeSpent: number,
    startDate?: string,
  ): Promise<any>;
}

export const loadBoardClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn
) => {
  class Board {
    public static async createBoard(doc: IBoard, userId?: string) {
      const board = await models.Boards.create({ ...doc, userId });

      // send database event log
      dispatcher.sendDbEventLog?.({
        action: 'create',
        docId: board._id,
        currentDocument: board.toObject(),
      });

      // create activity log
      dispatcher.createActivityLog?.({
        activityType: 'create',
        target: { _id: board._id, moduleName: 'sales', collectionName: 'boards' },
        action: { type: 'create', description: 'Board created' },
        changes: { name: board.name, type: board.type, createdAt: new Date() },
        metadata: { userId },
      });

      return board;
    }

    public static async updateBoard(_id: string, doc: IBoard, userId?: string) {
      const prevBoard = await models.Boards.findOne({ _id });
      if (!prevBoard) throw new Error('Board not found');

      await models.Boards.updateOne({ _id }, { $set: { ...doc, userId } });
      const updatedBoard = await models.Boards.findOne({ _id });
      if (!updatedBoard) throw new Error('Board not found');

      // send db event log
      dispatcher.sendDbEventLog?.({
        action: 'update',
        docId: updatedBoard._id,
        currentDocument: updatedBoard.toObject(),
        prevDocument: prevBoard.toObject(),
      });

      return updatedBoard;
    }

    public static async removeBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });
      if (!board) throw new Error('Board not found');

      dispatcher.sendDbEventLog?.({ action: 'delete', docId: board._id });
      dispatcher.createActivityLog?.({
        activityType: 'delete',
        target: { _id: board._id, moduleName: 'sales', collectionName: 'boards' },
        action: { type: 'delete', description: 'Board deleted' },
        changes: { name: board.name, deletedAt: new Date() },
        metadata: { userId: board.userId },
      });

      await models.Boards.deleteOne({ _id });
      return board;
    }
  }

  boardSchema.loadClass(Board);
  return boardSchema;
};
