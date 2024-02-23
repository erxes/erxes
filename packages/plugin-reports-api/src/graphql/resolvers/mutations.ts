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

  async reportChartsEditMany(_root, doc: any, { models, user }: IContext) {
    const { charts, reportId, serviceName } = doc;

    // const { repo };
    if (charts) {
      const service = await getService(serviceName);

      const chartTemplates = service.config?.meta?.reports?.chartTemplates;

      const existingCharts = await models.Charts.find({ reportId });

      const chartTemplatesSet = new Set(charts);
      const existingChartsList: string[] = [];
      const removeIds: string[] = [];

      for (const existingChart of existingCharts) {
        if (chartTemplatesSet.has(existingChart.templateType)) {
          existingChartsList.push(existingChart.templateType);
          continue;
        }

        // if user unchecked chart from report, remove it
        removeIds.push(existingChart._id);
      }

      const existingChartsSet = new Set(existingChartsList);
      const newCharts = new Set(
        charts.filter((c) => !existingChartsSet.has(c)),
      );
      const insertCharts: any[] = [];

      for (const chartTemplate of chartTemplates) {
        if (newCharts.has(chartTemplate.templateType)) {
          insertCharts.push(chartTemplate);
        }
      }

      // remove charts
      if (removeIds.length) {
        await models.Charts.deleteMany({ _id: { $in: removeIds } });
      }
      // insert charts
      if (insertCharts.length) {
        await models.Charts.insertMany(
          insertCharts.map((c) => {
            return {
              serviceName,
              chartType: c.chartTypes[0],
              reportId,
              ...c,
            };
          }),
        );
      }
    }

    return await models.Reports.updateReport(reportId, {
      ...doc,
      updatedAt: new Date(),
      updatedBy: user?._id || null,
    });
  },

  async reportChartsAddMany(_root, doc: any, { models }: IContext) {
    const { charts, reportId } = doc;
    const insertManyDocs: any[] = [];
    const totalChartsDict: { [serviceName: string]: any } = {};

    if (charts) {
      for (const chartParams of charts) {
        const { serviceName, chartTemplateTypes } = chartParams;
        if (!serviceName) {
          throw new Error(`serviceName is required!`);
        }

        if (serviceName in totalChartsDict) {
          totalChartsDict[serviceName] = [
            ...totalChartsDict[serviceName],
            ...chartTemplateTypes,
          ];
          continue;
        }
        totalChartsDict[serviceName] = chartTemplateTypes;
      }

      for (const serviceName of Object.keys(totalChartsDict)) {
        const totalCharts = totalChartsDict[serviceName];

        if (totalCharts.length) {
          const service = await getService(serviceName);

          const chartTemplates = service.config?.meta?.reports?.chartTemplates;

          const getChartTemplates = chartTemplates?.filter((t) =>
            totalCharts.includes(t.templateType),
          );

          if (getChartTemplates.length) {
            insertManyDocs.push(
              ...getChartTemplates.map((c) => ({
                serviceName,
                reportId,
                chartType: c.chartTypes[0],
                ...c,
              })),
            );
          }
        }
      }
    }

    if (insertManyDocs.length) {
      return await models.Charts.insertMany(insertManyDocs);
    }
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
