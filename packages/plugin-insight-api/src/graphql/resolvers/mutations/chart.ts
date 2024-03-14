import { getService } from '@erxes/api-utils/src/serviceDiscovery';
import { IContext } from '../../../connectionResolver';
import { IChart, IChartDocument } from '../../../models/definitions/insight';

const chartsMutations = {
  async chartsAdd(_root, doc: IChart, { models }: IContext) {
    return await models.Charts.createChart(doc);
  },

  async chartsAddMany(_root, doc: any, { models }: IContext) {
    const { charts, insightId } = doc;
    const insertManyDocs: any[] = [];
    const totalChartsDict: { [serviceName: string]: any } = {};

    if (charts) {
      for (const chartParams of charts) {
        const { serviceName, serviceType } = chartParams;
        if (!serviceName) {
          throw new Error(`serviceName is required!`);
        }

        if (serviceName in totalChartsDict) {
          totalChartsDict[serviceName] = [
            ...totalChartsDict[serviceName],
            ...serviceType,
          ];
          continue;
        }
        totalChartsDict[serviceName] = serviceType;
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
                insightId,
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

  async chartsEdit(
    _root,
    { _id, ...doc }: IChartDocument,
    { models }: IContext,
  ) {
    return await models.Charts.updateChart(_id, { ...doc });
  },

  async chartsEditMany(_root, doc: any, { models, user }: IContext) {
    const { charts, insightId, serviceName } = doc;

    // const { repo };
    if (charts) {
      const service = await getService(serviceName);

      const chartTemplates = service.config?.meta?.reports?.chartTemplates;

      const existingCharts = await models.Charts.find({ insightId });

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
              insightId,
              ...c,
            };
          }),
        );
      }
    }

    return await models.Reports.updateReport(insightId, {
      ...doc,
      updatedAt: new Date(),
      updatedBy: user?._id || null,
    });
  },

  async chartsRemove(_root, _id: string, { models }: IContext) {
    return await models.Charts.removeChart(_id);
  },
};

export default chartsMutations;
