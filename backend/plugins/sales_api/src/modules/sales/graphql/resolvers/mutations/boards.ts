import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IBoard, IBoardDocument } from '~/modules/sales/@types';

export const boardMutations = {
  /**
   * Create new board
   */
  async salesBoardsAdd(_root, doc: IBoard, { user, models }: IContext) {
    return await models.Boards.createBoard({ userId: user._id, ...doc });
  },

  /**
   * Edit board
   */
  async salesBoardsEdit(
    _root,
    { _id, ...doc }: IBoardDocument,
    { models }: IContext,
  ) {
    return await models.Boards.updateBoard(_id, doc);
  },

  /**
   * Remove board
   */
  async salesBoardsRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const board = await models.Boards.getBoard(_id);

    const relatedFieldsGroups = await sendTRPCMessage({
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
    { models }: IContext,
  ) {
    return models.Boards.updateTimeTracking(_id, status, timeSpent, startDate);
  },

  async salesBoardItemsSaveForGanttTimeline(
    _root,
    { items, links }: { items: any[]; links: any[] },
    { models }: IContext,
  ) {
    const bulkOps: any[] = [];

    for (const item of items) {
      bulkOps.push({
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
      });
    }

    await models.Deals.bulkWrite(bulkOps);

    return 'Success';
  },
};
