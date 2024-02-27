import { getService } from '@erxes/api-utils/src/serviceDiscovery';
import { IContext } from '../../../connectionResolver';
import { IChart, IChartDocument } from '../../../models/definitions/insight';

const chartsMutations = {
  async dashboardChartsAdd(_root, doc: IChart, { models }: IContext) {
    return await models.Charts.createChart(doc);
  },

  async dashboardChartsAddMany(_root, doc: any, { models }: IContext) {
    const { charts, dashboardId } = doc;
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
                dashboardId,
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

  async dashboardChartsEdit(
    _root,
    { _id, ...doc }: IChartDocument,
    { models }: IContext,
  ) {
    return await models.Charts.updateChart(_id, { ...doc });
  },

  async dashboardChartsRemove(_root, _id: string, { models }: IContext) {
    return await models.Charts.removeChart(_id);
  },
};

export default chartsMutations;
