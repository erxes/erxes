import { IContext } from '../../connectionResolver';
import {
  IChart,
  IChartDocument,
  IReport,
  IReportDocument
} from '../../models/definitions/reports';

const reportsMutations = {
  async reportsAdd(_root, doc: IReport, { models, user }: IContext) {
    return models.Reports.createReport({
      ...doc,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date()
    });
  },
  async reportsEdit(
    _root,
    { _id, ...doc }: IReportDocument,
    { models, user }: IContext
  ) {
    return models.Reports.updateReport(_id, {
      ...doc,
      updatedAt: new Date(),
      updatedBy: user._id
    });
  },
  async reportsRemove(_root, _id: string, { models }: IContext) {
    return models.Reports.removeReport(_id);
  },
  async reportsRemoveMany(_root, ids: string[], { models }: IContext) {
    return models.Reports.remove({ _id: { $in: ids } });
  },
  async chartsAdd(_root, doc: IChart, { models }: IContext) {
    return models.Charts.createChart(doc);
  },
  async chartsEdit(
    _root,
    { _id, ...doc }: IChartDocument,
    { models }: IContext
  ) {
    return models.Charts.updateChart(_id, doc);
  },
  async chartsRemove(_root, _id: string, { models }: IContext) {
    return models.Charts.removeChart(_id);
  }
};

export default reportsMutations;
