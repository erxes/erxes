import { checkPermission, requireLogin } from '@erxes/api-utils/src';
import * as moment from 'moment';
import { sendCoreMessage } from '../../../messageBroker';

const getDateRange = (filterType: string) => {
  return {
    $gte: new Date(
      moment()
        .add(filterType === 'today' ? 0 : 1, 'days')
        .format('YYYY-MM-DD')
    ),
    $lt: new Date(
      moment()
        .add(filterType === 'today' ? 1 : 8, 'days')
        .format('YYYY-MM-DD')
    )
  };
};

const exmFeedQueries = {
  exmFeedDetail: async (_root, params, { models }) => {
    return models.ExmFeed.findOne({ _id: params._id });
  },

  exmFeedCeremonies: async (_root, { contentType, filterType }, { models }) => {
    const filter: {
      'ceremonyData.willDate': any;
      contentType?: string;
    } = {
      'ceremonyData.willDate': getDateRange(filterType)
    };

    if (contentType) {
      filter.contentType = contentType;
    }

    return {
      list: await models.ExmFeed.find(filter),
      totalCount: await models.ExmFeed.find(filter).countDocuments()
    };
  },

  exmFeed: async (
    _root,
    {
      isPinned,
      title,
      contentTypes,
      limit,
      skip,
      recipientType,
      type,
      startDate,
      endDate,
      bravoType
    },
    { models, user, subdomain }
  ) => {
    const departmentIds = user.departmentIds;

    const units = await sendCoreMessage({
      subdomain,
      action: 'units.find',
      data: {
        userIds: user._id
      },
      isRPC: true,
      defaultValue: []
    });

    const branches = await sendCoreMessage({
      subdomain,
      action: 'branches.find',
      data: { query: { userIds: user._id } },
      isRPC: true,
      defaultValue: []
    });

    const unitIds = units.map(unit => unit._id) || [];
    const branchIds = branches.map(branch => branch._id) || [];

    const unitCondition = [
      { unitId: { $exists: false } },
      { unitId: null },
      { unitId: '' }
    ];

    const branchCondition = [
      { branchIds: { $eq: [] } },
      { branchIds: { $size: 0 } }
    ];

    const departmentCondition = [
      { branchIds: { $eq: [] } },
      { branchIds: { $size: 0 } }
    ];

    const filter: any = {
      $or: [
        {
          $and: [
            { branchIds: { $in: branchIds } },
            { unitId: { $in: unitIds } },
            { departmentIds: { $in: departmentIds } }
          ]
        },
        {
          $and: [
            { branchIds: { $in: branchIds } },
            {
              $or: unitCondition
            }
          ]
        },
        {
          $and: [
            { unitId: { $in: unitIds } },
            {
              $or: branchCondition
            }
          ]
        },
        {
          $and: [
            { departmentIds: { $in: departmentIds } },
            {
              $or: departmentCondition
            }
          ]
        },
        {
          $and: [
            {
              $or: branchCondition
            },
            {
              $or: unitCondition
            },
            {
              $or: departmentCondition
            }
          ]
        },
        { createdBy: user._id }
      ]
    };

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (
      contentTypes &&
      contentTypes.includes('publicHoliday') &&
      type === 'recipient'
    ) {
      filter.createdAt = { $lt: new Date() };
    }

    if (title) {
      filter.title = new RegExp(`.*${title}.*`, 'i');
    }

    if (contentTypes && contentTypes.length > 0) {
      filter.contentType = { $in: contentTypes };
    }

    if (contentTypes && contentTypes.includes('event')) {
      filter.$or.push(
        { 'eventData.visibility': 'public' },
        {
          'eventData.visibility': 'private',
          recipientIds: { $in: [user._id] },
          createdBy: { $in: user._id }
        }
      );
    }

    if (contentTypes && contentTypes.includes('bravo')) {
      if (recipientType === 'recieved') {
        filter.recipientIds = { $in: [user._id] };
      } else if (recipientType === 'sent') {
        filter.createdBy = user._id;
      } else {
        filter.$or.push(
          { recipientIds: { $in: [user._id] } },
          { createdBy: user._id }
        );
      }
    }

    if (isPinned !== undefined) {
      if (isPinned) {
        filter.isPinned = true;
      } else {
        filter.isPinned = { $ne: true };
      }
    }

    if (bravoType) {
      filter.customFieldsData = { $elemMatch: { value: bravoType } };
    }

    return {
      list: await models.ExmFeed.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip || 0)
        .limit(limit || 20),
      totalCount: await models.ExmFeed.find(filter).countDocuments()
    };
  }
};

// checkPermission(exmFeedQueries, "exmFeedDetail", "showExmActivityFeed");
// checkPermission(exmFeedQueries, "exmFeedCeremonies", "showExmActivityFeed");
// checkPermission(exmFeedQueries, "exmFeed", "showExmActivityFeed");

export default exmFeedQueries;
