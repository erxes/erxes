import { checkPermission, requireLogin } from '@erxes/api-utils/src';
const exmThankQueries = {
  exmThanks: async (
    _root,
    { limit, skip, type },
    { models, checkPermission, user }
  ) => {
    const doc: { createdBy?: string; recipientIds?: any } = {};

    if (type === 'recipient') {
      doc.recipientIds = { $in: [user._id] };
    } else if (type === 'createdByMe') {
      doc.createdBy = user._id;
    }

    return {
      list: await models.ExmThanks.find(doc)
        .sort({ createdAt: -1 })
        .skip(skip || 0)
        .limit(limit || 20),
      totalCount: await models.ExmThanks.find(doc).countDocuments(),
    };
  },
};
requireLogin(exmThankQueries, 'showExmActivityFeed');
checkPermission(exmThankQueries, 'exmThanks', 'showExmActivityFeed');

export default exmThankQueries;
