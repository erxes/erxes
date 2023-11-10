import { serviceDiscovery } from '../../configs';
import { IContext } from '../../connectionResolver';
import {
  IChart,
  IChartDocument,
  IReport,
  IReportDocument
} from '../../models/definitions/reports';

const reportsMutations = {
  async reportsAdd(_root, doc: IReport, { models, user }: IContext) {
    const report = await models.Reports.createReport({
      ...doc,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date()
    });

    if (doc.reportTemplateType) {
      const service = await serviceDiscovery.getService(doc.serviceName, true);
      const reportTemplate = service.config?.meta?.reports?.reportTemplates?.find(
        t => t.type === doc.reportTemplateType
      );

      const chartTemplates = service.config?.meta?.reports?.chartTemplates;

      const { charts } = reportTemplate;
      let getChartTemplates;

      if (charts) {
        getChartTemplates = chartTemplates?.filter(t =>
          charts.includes(t.templateType)
        );
      }

      if (getChartTemplates) {
        await models.Charts.insertMany({
          docs: getChartTemplates.map(c => ({ ...c, reportId: report._id }))
        });
      }
    }

    return report;
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
  async reportsRemoveMany(_root, { ids }, { models }: IContext) {
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
