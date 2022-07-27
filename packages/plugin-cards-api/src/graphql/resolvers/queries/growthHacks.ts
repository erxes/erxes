import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IListParams } from './boards';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  generateGrowthHackCommonFilters,
  IArchiveArgs
} from './utils';

interface IGrowthHackListParams extends IListParams {
  hackStage?: string;
  limit?: number;
}

const growthHackQueries = {
  /**
   * Growth hack list
   */
  async growthHacks(
    _root,
    args: IGrowthHackListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = {
      ...(await generateGrowthHackCommonFilters(
        models,
        subdomain,
        user._id,
        args
      ))
    };
    const { sortField, sortDirection, skip = 0, limit = 10 } = args;

    const sort: { [key: string]: any } = {};

    if (sortField) {
      sort[sortField] = sortDirection;
    }

    sort.order = 1;
    sort.createdAt = -1;

    return models.GrowthHacks.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  },

  /**
   * Archived list
   */
  archivedGrowthHacks(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args, models.GrowthHacks);
  },

  archivedGrowthHacksCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.GrowthHacks);
  },

  /**
   * Get all growth hacks count. We will use it in pager
   */
  async growthHacksTotalCount(
    _root,
    args: IGrowthHackListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generateGrowthHackCommonFilters(
      models,
      subdomain,
      user._id,
      args
    );

    return models.GrowthHacks.find(filter).count();
  },

  async growthHacksPriorityMatrix(
    _root,
    args: IListParams,
    { user, models, subdomain }: IContext
  ) {
    const filter = await generateGrowthHackCommonFilters(
      models,
      subdomain,
      user._id,
      args
    );

    filter.ease = { $exists: true, $gt: 0 };
    filter.impact = { $exists: true, $gt: 0 };

    return models.GrowthHacks.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: {
            impact: '$impact',
            ease: '$ease'
          },
          names: { $push: '$name' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          x: '$_id.ease',
          y: '$_id.impact',
          names: 1,
          count: 1
        }
      }
    ]);
  },

  /**
   * Growth hack detail
   */
  async growthHackDetail(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext
  ) {
    const growthHack = await models.GrowthHacks.getGrowthHack(_id);

    return checkItemPermByUser(models, user._id, growthHack);
  }
};

moduleRequireLogin(growthHackQueries);

checkPermission(growthHackQueries, 'growthHacks', 'showGrowthHacks', []);

export default growthHackQueries;
