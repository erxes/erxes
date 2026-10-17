import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IBoard, IBoardDocument } from '../../@types';
import { boardSchema } from '../definitions/boards';
import { removePipelineStagesWithItems } from '~/modules/sales/graphql/resolvers/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError, graphqlPubsub } from 'erxes-api-shared/utils';
import { assertDealUpdatesAllowed } from '../../utils/archiveGuard';
import { SALES_STATUSES } from '../../constants';
import {
  assertBoardArchiveAccess,
  archiveBoardDescendants,
  getBoardArchivePreview,
  getBoardArchiveScope,
  BoardArchivePreview,
} from '../../utils/boardArchive';
import type { IDealDocument } from '../../@types';

export interface IBoardModel extends Model<IBoardDocument> {
  getBoard(_id: string): Promise<IBoardDocument>;
  createBoard(doc: IBoard, userId?: string): Promise<IBoardDocument>;
  updateBoard(
    _id: string,
    doc: IBoard,
    userId?: string,
  ): Promise<IBoardDocument>;
  removeBoard(_id: string): Promise<object>;
  archivePreview(
    _id: string,
    user: IUserDocument,
  ): Promise<BoardArchivePreview>;
  archiveBoard(
    _id: string,
    user: IUserDocument,
    acknowledgeAutomations?: boolean,
    acknowledgeConnections?: boolean,
  ): Promise<IBoardDocument>;
  unarchiveBoard(_id: string): Promise<IBoardDocument>;
  updateTimeTracking(
    _id: string,
    status: string,
    timeSpent: number,
    startDate?: string,
  ): Promise<IDealDocument | null>;
}

export const loadBoardClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  const prepareArchive = async (_id: string, user: IUserDocument) => {
    const scope = await getBoardArchiveScope(models, _id);
    await assertBoardArchiveAccess(models, subdomain, scope, user);
    const preview = await getBoardArchivePreview(models, subdomain, scope);
    return { scope, preview };
  };

  const publishArchiveEvent = (
    boardId: string,
    action: 'boardArchived' | 'boardUnarchived' | 'boardArchiveProgress',
  ) =>
    graphqlPubsub.publish('salesPipelineListChanged', {
      salesPipelineListChanged: {
        _id: boardId,
        action,
        data: {
          boardId,
          ...(action === 'boardArchived'
            ? { status: SALES_STATUSES.ARCHIVED }
            : action === 'boardUnarchived'
            ? { status: SALES_STATUSES.ACTIVE }
            : {}),
        },
      },
    });

  const finishStatusChange = async (
    previous: IBoardDocument,
    action: 'boardArchived' | 'boardUnarchived',
  ): Promise<IBoardDocument> => {
    const updated = await models.Boards.getBoard(previous._id);
    sendDbEventLog?.({
      action: 'update',
      docId: previous._id,
      prevDocument: previous.toObject(),
      currentDocument: updated.toObject(),
    });
    await publishArchiveEvent(previous._id, action).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      process.stderr.write(
        `[sales] Board ${previous._id} status saved, but its notification failed: ${reason}\n`,
      );
    });
    return updated;
  };

  class Board {
    public static async archivePreview(
      _id: string,
      user: IUserDocument,
    ): Promise<BoardArchivePreview> {
      return (await prepareArchive(_id, user)).preview;
    }

    public static async archiveBoard(
      _id: string,
      user: IUserDocument,
      acknowledgeAutomations = false,
      acknowledgeConnections = false,
    ): Promise<IBoardDocument> {
      const previous = await models.Boards.getBoard(_id);
      if (previous.status === SALES_STATUSES.ARCHIVED) return previous;

      const { scope, preview } = await prepareArchive(_id, user);
      if (
        preview.automationCount > 0 &&
        !acknowledgeAutomations &&
        !acknowledgeConnections
      ) {
        throw new ExpectedError(
          'Active automations are connected to this board. Review the archive preview and confirm again.',
          'AUTOMATION_CONFIRMATION_REQUIRED',
        );
      }
      if (
        (preview.posCount > 0 || preview.paymentCount > 0) &&
        !acknowledgeConnections
      ) {
        throw new ExpectedError(
          'POS or payment configurations are connected to this board. Review the archive preview and confirm again.',
          'CONNECTION_CONFIRMATION_REQUIRED',
        );
      }

      const started = await models.Boards.updateOne(
        { _id, status: { $ne: SALES_STATUSES.ARCHIVED } },
        { $set: { archiveInProgress: true } },
      );
      if (started.matchedCount === 0) return models.Boards.getBoard(_id);

      try {
        await archiveBoardDescendants(
          models,
          scope,
          preview.dealCount,
          user._id,
        );
        await models.Boards.updateOne(
          { _id },
          {
            $set: {
              status: SALES_STATUSES.ARCHIVED,
              archiveInProgress: false,
            },
          },
        );
      } catch (archiveError: unknown) {
        await publishArchiveEvent(_id, 'boardArchiveProgress').catch(
          () => undefined,
        );
        const reason =
          archiveError instanceof Error ? archiveError.message : 'Write failed';
        throw Object.assign(
          new ExpectedError(
            `Archiving was interrupted. Some records may already be archived. Click Archive again to finish. ${reason}`,
            'ARCHIVE_INCOMPLETE',
          ),
          { extensions: { code: 'ARCHIVE_INCOMPLETE' } },
        );
      }

      return finishStatusChange(previous, 'boardArchived');
    }

    public static async unarchiveBoard(_id: string): Promise<IBoardDocument> {
      const previous = await models.Boards.getBoard(_id);
      if (previous.archiveInProgress) {
        throw new ExpectedError(
          'Finish the interrupted board archive before unarchiving it.',
          'CONFLICT',
        );
      }
      if (previous.status !== SALES_STATUSES.ARCHIVED) return previous;

      const result = await models.Boards.updateOne(
        {
          _id,
          status: SALES_STATUSES.ARCHIVED,
          archiveInProgress: { $ne: true },
        },
        { $set: { status: SALES_STATUSES.ACTIVE } },
      );
      if (result.matchedCount === 0) {
        throw new ExpectedError(
          'Board status changed. Refresh and try again.',
          'CONFLICT',
        );
      }
      return finishStatusChange(previous, 'boardUnarchived');
    }

    /** Get board */
    public static async getBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });
      if (!board) throw new Error('Board not found');
      return board;
    }

    /** Create board */
    public static async createBoard(doc: IBoard, userId?: string) {
      const board = await models.Boards.create({ ...doc, userId });

      sendDbEventLog?.({
        action: 'create',
        docId: board._id,
        currentDocument: board.toObject(),
      });

      return board;
    }

    /** Update board */
    public static async updateBoard(_id: string, doc: IBoard, userId?: string) {
      const prevBoard = await models.Boards.findOne({ _id });
      if (!prevBoard) throw new Error('Board not found');

      await models.Boards.updateOne({ _id }, { $set: { ...doc, userId } });

      const updatedBoard = await models.Boards.findOne({ _id });
      if (!updatedBoard) throw new Error('Board not found after update');

      sendDbEventLog?.({
        action: 'update',
        docId: updatedBoard._id,
        currentDocument: updatedBoard.toObject(),
        prevDocument: prevBoard.toObject(),
      });

      return updatedBoard;
    }

    /** Remove board */
    public static async removeBoard(_id: string) {
      const board = await models.Boards.findOne({ _id });
      if (!board) throw new Error('Board not found');

      const pipelines = await models.Pipelines.find({ boardId: _id });

      for (const pipeline of pipelines) {
        await removePipelineStagesWithItems(models, pipeline._id);
      }

      for (const pipeline of pipelines) {
        await models.Pipelines.removePipeline(pipeline._id, true);
      }

      sendDbEventLog?.({
        action: 'delete',
        docId: board._id,
      });

      await models.Boards.deleteOne({ _id });
      return board;
    }

    /** Update time tracking (Deals) */
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

      if (startDate) doc.startDate = startDate;

      const deal = await models.Deals.getDeal(_id);
      await assertDealUpdatesAllowed(models, [deal], { timeTrack: doc });

      await models.Deals.updateOne({ _id }, { $set: { timeTrack: doc } });
      return models.Deals.findOne({ _id }).lean();
    }
  }

  boardSchema.loadClass(Board);
  return boardSchema;
};
