import { GrowthHacks } from '../../../db/models';
import { checkPermission, moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateGrowthHackCommonFilters,
  IArchiveArgs,
} from './boardUtils';

interface IGrowthHackListParams extends IListParams {
  hackStage?: string;
  limit?: number;
}

const growthHackQueries = {
  /**
   * Growth hack list
   */
  async growthHacks(_root, args: IGrowthHackListParams, { user, commonQuerySelector }: IContext) {
    const filter = { ...commonQuerySelector, ...(await generateGrowthHackCommonFilters(user._id, args)) };
    const { sortField, sortDirection, skip = 0, limit = 10 } = args;

    const sort: { [key: string]: any } = {};

    if (sortField) {
      sort[sortField] = sortDirection;
    }

    sort.order = 1;
    sort.createdAt = -1;

    return GrowthHacks.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  /**
   * Archived list
   */
  archivedGrowthHacks(_root, args: IArchiveArgs) {
    return archivedItems(args, GrowthHacks);
  },

  archivedGrowthHacksCount(_root, args: IArchiveArgs) {
    return archivedItemsCount(args, GrowthHacks);
  },

  /**
   * Get all growth hacks count. We will use it in pager
   */
  async growthHacksTotalCount(_root, args: IGrowthHackListParams, { user }: IContext) {
    const filter = await generateGrowthHackCommonFilters(user._id, args);

    return GrowthHacks.find(filter).countDocuments();
  },

  async growthHacksPriorityMatrix(_root, args: IListParams, { user }: IContext) {
    const filter = await generateGrowthHackCommonFilters(user._id, args);

    filter.ease = { $exists: true, $gt: 0 };
    filter.impact = { $exists: true, $gt: 0 };

    return GrowthHacks.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: {
            impact: '$impact',
            ease: '$ease',
          },
          names: { $push: '$name' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          x: '$_id.ease',
          y: '$_id.impact',
          names: 1,
          count: 1,
        },
      },
    ]);
  },

  /**
   * Growth hack detail
   */
  async growthHackDetail(_root, { _id }: { _id: string }, { user }: IContext) {
    const growthHack = await GrowthHacks.getGrowthHack(_id);

    return checkItemPermByUser(user._id, growthHack);
  },
};

moduleRequireLogin(growthHackQueries);

checkPermission(growthHackQueries, 'growthHacks', 'showGrowthHacks', []);

export default growthHackQueries;
