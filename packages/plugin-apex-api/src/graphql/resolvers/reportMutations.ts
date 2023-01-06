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
  }
};

moduleCheckPermission(reportMutations, 'manageApexReports');

export default reportMutations;
