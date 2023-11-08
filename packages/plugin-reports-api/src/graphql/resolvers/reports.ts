import { IContext } from '../../connectionResolver';
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
  }
};
