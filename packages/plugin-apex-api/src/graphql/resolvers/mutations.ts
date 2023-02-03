import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const reportMutations = {
  apexReportSave(_root, args, { user, models }: IContext) {
    const { _id, ...doc } = args;

    return models.Reports.saveReport({
      _id,
      doc: { ...doc, createdUserId: user._id }
    });
  },

  apexReportRemove(_root, { _id }, { models }: IContext) {
    return models.Reports.deleteOne({ _id });
  },

  apexStorySave(_root, args, { user, models }: IContext) {
    const { _id, ...doc } = args;

    return models.Stories.saveStory({
      _id,
      doc: { ...doc, createdUserId: user._id }
    });
  },

  apexStoryRemove(_root, { _id }, { models }: IContext) {
    return models.Stories.deleteOne({ _id });
  },

  apexStoryRead(_root, { _id }, { models, cpUser }) {
    if (!cpUser) {
      return;
    }

    return models.Stories.update(
      { _id },
      { $push: { readUserIds: [cpUser.cpUserId] } }
    );
  }
};

moduleCheckPermission(reportMutations, 'manageApexReports');

export default reportMutations;
