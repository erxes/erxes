import { getService } from "@erxes/api-utils/src/serviceDiscovery";
import {
  IDashboard,
  IDashboardDocument
} from "../../../db/models/definitions/insight";
import { IContext } from "../../../connectionResolver";
import { registerOnboardHistory } from "../../utils";
import { compareArrays } from "../../modules/insight/utils";

interface IDashboardEdit extends IDashboard {
  _id: string;
}

const SERVICE_MAP = {
  'contacts': 'core:contacts',
  'forms': 'core:forms',
}

const getChartTemplatesForService = async (serviceName, charts) => {
  const service = await getService(serviceName);
  const chartTemplates = service.config?.meta?.reports?.chartTemplates;

  return chartTemplates?.filter(t => charts.includes(t.templateType));
};

const addChartsForDashboard = async (
  contentId,
  serviceName,
  charts,
  models
) => {
  const chartTemplates = await getChartTemplatesForService(serviceName, charts);

  if (chartTemplates) {
    await models.Charts.insertMany(
      chartTemplates.map(c => ({
        serviceName: SERVICE_MAP[c.serviceType] || serviceName,
        chartType: c.chartTypes[0],
        contentId,
        contentType: "core:dashboard",
        ...c
      }))
    );
  }
};

const removeChartsForDashboard = async (
  dashboardCharts,
  removedTemplates,
  models
) => {
  const ids = dashboardCharts
    .filter(chart => removedTemplates.includes(chart.templateType))
    .map(chart => chart._id);

  await models.Charts.deleteMany({ _id: { $in: ids } });
};

const dashboardMutations = {
  /**
   * Creates a new dashboard
   */

  async dashboardAdd(
    _root,
    doc: IDashboard,
    { models, user, subdomain }: IContext
  ) {
    const dashboard = await models.Dashboards.createDashboard({
      ...doc,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date()
    });

    const { charts, serviceTypes, serviceNames } = doc;

    if (serviceTypes && serviceNames) {
      for (const serviceName of serviceNames) {
        await addChartsForDashboard(dashboard._id, serviceName, charts, models);
      }
    }

    registerOnboardHistory({ models, type: `InsightCreate`, user });

    return dashboard;
  },

  /**
   * Add to dashboard
   */

  async dashboardAddTo(_root, doc: IDashboard, { models, user }: IContext) {
    const dashboard = await models.Dashboards.createDashboard({
      ...doc,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date()
    });

    if (doc.charts) {
      const charts = doc.charts.map(chart => ({
        ...chart,
        _id: undefined,
        contentId: dashboard._id
      }));
      await models.Charts.insertMany(charts);
    }

    return dashboard;
  },

  /**
   * Edit a dashboard
   */

  async dashboardEdit(
    _root,
    { _id, ...doc }: IDashboardDocument,
    { models, user }: IContext
  ) {
    const dashboard = await models.Dashboards.findOne({ _id });
    const dashboardCharts = await models.Charts.find({ contentId: _id });
    const baseCharts = dashboardCharts.map(item => item.templateType);
    const changes = compareArrays(baseCharts, doc.charts || []);

    if (changes && doc.serviceTypes && doc.serviceNames) {
      if (changes.added.length) {
        for (const serviceName of doc.serviceNames) {
          await addChartsForDashboard(_id, serviceName, changes.added, models);
        }
      }

      if (changes.removed.length) {
        await removeChartsForDashboard(
          dashboardCharts,
          changes.removed,
          models
        );
      }
    } else if (doc.charts) {
      for (const chart of doc.charts) {
        await models.Charts.updateChart(chart._id, { ...chart });
      }
    }

    const userIds = new Set<string>(dashboard?.userIds || []);

    if (doc.userId) {
      userIds.has(doc.userId) ? userIds.delete(doc.userId) : userIds.add(doc.userId);

      doc.userIds = [...userIds];
    }

    return await models.Dashboards.updateDashboard(_id, {
      ...doc,
      updatedAt: new Date(),
      updatedBy: user._id
    });
  },

  /**
   * Removes a dashboard
   */

  async dashboardRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    await models.Charts.deleteMany({ contentId: _id });
    const dashboard = await models.Dashboards.removeDashboard(_id);
    return dashboard;
  },

  /**
   * Duplicate a dashboard
   */
  async dashboardDuplicate(_root, _id: string, { models, user }: IContext) {
    const dashboard = await models.Dashboards.findById(_id);
    if (!dashboard) {
      throw new Error("Dashboard not found");
    }

    const { _id: _, ...dup } = dashboard.toObject();

    const duplicatedDashboard = await models.Dashboards.createDashboard({
      ...dup,
      name: `${dashboard.name} copied`,
      createdBy: user._id,
      createdAt: new Date(),
      updatedBy: user._id,
      updatedAt: new Date()
    });

    const charts = await models.Charts.find({ contentId: _id });
    const duplicatedCharts = charts.map(chart => ({
      ...chart.toObject(),
      _id: undefined,
      contentId: duplicatedDashboard._id
    }));
    await models.Charts.insertMany(duplicatedCharts);

    return duplicatedDashboard;
  }
};

export default dashboardMutations;
