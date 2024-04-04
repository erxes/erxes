import { IContext } from '../../connectionResolver';
import { sendTagsMessage } from '../../messageBroker';
import { IReportDocument } from '../../models/definitions/reports';

export default {
  async charts(
    report: IReportDocument,
    {},
    { models }: IContext,
    { queryParams }
  ) {
    try {
      const { _id } = report;
      return models.Charts.find({ reportId: _id });
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  chartsCount(report: IReportDocument, {}, { models }: IContext) {
    try {
      const { _id } = report;
      return models.Charts.find({ reportId: _id }).countDocuments();
    } catch (error) {
      return new Error(`Invalid ${error.path}: ${error.value}`);
    }
  },
  createdBy(report: IReportDocument) {
    return (
      report.createdBy && {
        __typename: 'User',
        _id: report.createdBy
      }
    );
  },

  updatedBy(report: IReportDocument) {
    return (
      report.updatedBy && {
        __typename: 'User',
        _id: report.updatedBy
      }
    );
  },

  members(report: IReportDocument) {
    return (report.assignedUserIds || []).map(_id => ({
      __typename: 'User',
      _id
    }));
  },

  async tags(report: IReportDocument, _, { subdomain }: IContext) {
    return sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        _id: { $in: report.tagIds }
      },
      isRPC: true
    });
  }
};
