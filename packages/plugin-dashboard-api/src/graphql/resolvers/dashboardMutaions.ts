import { IContext } from '../../connectionResolver';
import {
  IDashboard,
  IDashboardItemInput
} from '../../models/definitions/dashboard';

interface IDashboardEdit extends IDashboard {
  _id: string;
}
interface IDashboardItemEdit extends IDashboardItemInput {
  _id: string;
}

const dashboardsMutations = {
  async dashboardAdd(
    _root,
    doc: IDashboard,
    { docModifier, models }: IContext
  ) {
    const dashboard = await models.Dashboards.create(docModifier(doc));

    return dashboard;
  },

  async dashboardEdit(
    _root,
    { _id, ...fields }: IDashboardEdit,
    { models }: IContext
  ) {
    return models.Dashboards.editDashboard(_id, fields);
  },

  async dashboardRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Dashboards.removeDashboard(_id);
  },

  async dashboardItemAdd(
    _root,
    doc: IDashboardItemInput,
    { models }: IContext
  ) {
    const dashboardItem = await models.DashboardItems.addDashboardItem({
      ...doc
    });

    return dashboardItem;
  },

  async dashboardItemEdit(
    _root,
    { _id, ...fields }: IDashboardItemEdit,
    { models }: IContext
  ) {
    return models.DashboardItems.editDashboardItem(_id, fields);
  },

  async dashboardItemRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.DashboardItems.removeDashboardItem(_id);
  }
};

export default dashboardsMutations;
