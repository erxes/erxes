import { ExpectedError, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IBoard, IBoardDocument } from '~/modules/sales/@types';
import { assertBoardArchivePermissions } from '../../../utils/boardArchive';
import { assertDealUpdatesAllowed } from '../../../utils/archiveGuard';

export const boardMutations = {
  async salesBoardsUnarchive(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('boardsArchive');
    return models.Boards.unarchiveBoard(_id);
  },
  async salesBoardsArchive(
    _root: unknown,
    {
      _id,
      acknowledgeAutomations,
      acknowledgeConnections,
    }: {
      _id: string;
      acknowledgeAutomations?: boolean;
      acknowledgeConnections?: boolean;
    },
    { models, user, checkPermission }: IContext,
  ) {
    await assertBoardArchivePermissions(checkPermission);
    return models.Boards.archiveBoard(
      _id,
      user,
      acknowledgeAutomations,
      acknowledgeConnections,
    );
  },
  /**
   * Create new board
   */
  async salesBoardsAdd(
    _root,
    doc: IBoard,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('boardsAdd');
    return await models.Boards.createBoard({ userId: user._id, ...doc });
  },

  /**
   * Edit board
   */
  async salesBoardsEdit(
    _root,
    { _id, ...doc }: IBoardDocument,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('boardsEdit');
    return await models.Boards.updateBoard(_id, doc);
  },

  /**
   * Remove board
   */
  async salesBoardsRemove(
    _root,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('boardsRemove');
    const board = await models.Boards.getBoard(_id);

    const relatedFieldsGroups = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'fieldsGroups',
      action: 'find',
      input: {
        query: {
          boardIds: board._id,
        },
      },
      defaultValue: [],
    });

    for (const fieldGroup of relatedFieldsGroups) {
      const boardIds = fieldGroup.boardIds || [];
      fieldGroup.boardIds = boardIds.filter((e) => e !== board._id);

      await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'mutation',
        module: 'fieldsGroups',
        action: 'updateGroup',
        input: { groupId: fieldGroup._id, fieldGroup },
      });
    }

    return models.Boards.removeBoard(_id);
  },

  async salesBoardItemUpdateTimeTracking(
    _root,
    {
      _id,
      status,
      timeSpent,
      startDate,
    }: {
      _id: string;
      status: string;
      timeSpent: number;
      startDate: string;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('updateTimeTracking');
    return models.Boards.updateTimeTracking(_id, status, timeSpent, startDate);
  },

  async salesBoardItemsSaveForGanttTimeline(
    _root: unknown,
    {
      items,
      links,
    }: {
      items: {
        _id: string;
        startDate?: string | Date | null;
        closeDate?: string | Date | null;
      }[];
      links: { id?: string; start: string; end?: string }[];
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('dealsEdit');
    if (
      !Array.isArray(items) ||
      !Array.isArray(links) ||
      items.some(
        (item) => !item || typeof item._id !== 'string' || !item._id.trim(),
      ) ||
      links.some((link) => !link || typeof link.start !== 'string')
    ) {
      throw new ExpectedError(
        'Valid timeline items and links are required.',
        'BAD_USER_INPUT',
      );
    }
    if (!items.length) return 'Success';
    const ids = [...new Set(items.map((item) => item._id))];
    const deals = await models.Deals.find({ _id: { $in: ids } })
      .select({ _id: 1, name: 1, stageId: 1, status: 1 })
      .lean();
    if (deals.length !== ids.length)
      throw new ExpectedError('Deal not found.', 'NOT_FOUND');
    await assertDealUpdatesAllowed(models, deals, { relations: links });

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: {
          _id: item._id,
        },
        update: {
          $set: {
            startDate: item.startDate,
            closeDate: item.closeDate,
            relations: links.filter((link) => link.start === item._id),
          },
        },
      },
    }));

    await models.Deals.bulkWrite(bulkOps);

    return 'Success';
  },
};
