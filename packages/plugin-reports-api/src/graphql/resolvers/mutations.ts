import { getService } from '@erxes/api-utils/src/serviceDiscovery';
import { IContext } from '../../connectionResolver';
import {
  IChart,
  IChartDocument,
  IReport,
  IReportDocument,
} from '../../models/definitions/reports';

const reportsMutations = {
  async reportsAdd(_root, doc: IReport, { models, user }: IContext) {
    const report = await models.Reports.createReport({
      ...doc,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date(),
    });

    if (doc.reportTemplateType) {
      if (!doc.serviceName) {
        throw new Error(`doc.serviceName is ${doc.serviceName}`);
      }
      const service = await getService(doc.serviceName);

      const reportTemplate =
        service.config?.meta?.reports?.reportTemplates?.find(
          (t) => t.serviceType === doc.reportTemplateType,
        );

      const chartTemplates = service.config?.meta?.reports?.chartTemplates;

      const { charts } = doc;
      const { serviceName } = reportTemplate;
      let getChartTemplates;

      if (charts) {
        getChartTemplates = chartTemplates?.filter((t) =>
          charts.includes(t.templateType),
        );
      } else {
        // create with default charts
        getChartTemplates = chartTemplates?.filter((t) =>
          reportTemplate.charts.includes(t.templateType),
        );
      }

      if (getChartTemplates) {
        await models.Charts.insertMany(
          getChartTemplates.map((c) => {
            return {
              serviceName,
              chartType: c.chartTypes[0],
              reportId: report._id,
              ...c,
            };
          }),
        );
      }
    }

    return report;
  },
  async reportsEdit(
    _root,
    { _id, ...doc }: IReportDocument,
    { models, user }: IContext,
  ) {
    if (doc.charts) {
      const { charts } = doc;

      for (const chart of charts) {
        await models.Charts.updateChart(chart._id, { ...chart });
      }
    }

    return models.Reports.updateReport(_id, {
      ...doc,
      updatedAt: new Date(),
      updatedBy: user._id,
    });
  },
  async reportsRemove(_root, _id: string, { models }: IContext) {
    await models.Charts.remove({ reportId: _id });
    return models.Reports.removeReport(_id);
  },
  async reportsRemoveMany(_root, { ids }, { models }: IContext) {
    await models.Charts.remove({ reportId: { $in: ids } });
    return models.Reports.remove({ _id: { $in: ids } });
  },
  async reportChartsAdd(_root, doc: IChart, { models }: IContext) {
    return models.Charts.createChart(doc);
  },
  async reportChartsEdit(
    _root,
    { _id, ...doc }: IChartDocument,
    { models }: IContext,
  ) {
    return models.Charts.updateChart(_id, { ...doc });
  },
  reportChartsRemove(_root, _id: string, { models }: IContext) {
    return models.Charts.removeChart(_id);
  },
};

export default reportsMutations;
