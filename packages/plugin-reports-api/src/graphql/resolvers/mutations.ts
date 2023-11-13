import { createGenerateModels } from '@erxes/api-utils/src/core';
import { serviceDiscovery } from '../../configs';
import { IContext } from '../../connectionResolver';
import {
  IChart,
  IChartDocument,
  IReport,
  IReportDocument
} from '../../models/definitions/reports';
import { Server } from 'http';

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
      console.log('aa ', doc.serviceName);
      const service = await serviceDiscovery.getService(doc.serviceName, true);
      console.log(service);

      const reportTemplate = service.config?.meta?.reports?.reportTemplates?.find(
        t => t.type === doc.reportTemplateType
      );

      console.log('tttt   ', reportTemplate);
      const chartTemplates = service.config?.meta?.reports?.chartTemplates;

      const { charts } = reportTemplate;
      let getChartTemplates;

      if (charts) {
        getChartTemplates = chartTemplates?.filter(t =>
          charts.includes(t.templateType)
        );
      }

      if (getChartTemplates) {
        // console.log('aa ', getChartTemplates, report._id);
        await models.Charts.insertMany(
          getChartTemplates.map(c => {
            console.log('lil ', {
              template: c.templateType,
              chartType: c.chartTypes[0],
              reportId: report._id
            });
            return {
              template: c.templateType,
              chartType: c.chartTypes[0],
              reportId: report._id
            };
          })
        );
      }
    }

    return report;
  },
  async reportsEdit(
    _root,
    { _id, ...doc }: IReportDocument,
    { models, user }: IContext
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
      updatedBy: user._id
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
