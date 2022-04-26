import { IContext } from '@erxes/api-utils/src';
import { DashboardItems, Dashboards } from '../../../db/models';
import {
  IDashboard,
  IDashboardItemInput
} from '../../../db/models/definitions/dashboard';

interface IDashboardEdit extends IDashboard {
  _id: string;
}
interface IDashboardItemEdit extends IDashboardItemInput {
  _id: string;
}

const dashboardsMutations = {
  async dashboardAdd(_root, doc: IDashboard, { docModifier }: IContext) {
    const dashboard = await Dashboards.create(docModifier(doc));

    return dashboard;
  },

  async dashboardEdit(_root, { _id, ...fields }: IDashboardEdit) {
    return Dashboards.editDashboard(_id, fields);
  },

  async dashboardRemove(_root, { _id }: { _id: string }) {
    return Dashboards.removeDashboard(_id);
  },

  async dashboardItemAdd(_root, doc: IDashboardItemInput) {
    const dashboardItem = await DashboardItems.addDashboardItem({ ...doc });

    return dashboardItem;
  },

  async dashboardItemEdit(_root, { _id, ...fields }: IDashboardItemEdit) {
    return DashboardItems.editDashboardItem(_id, fields);
  },

  async dashboardItemRemove(_root, { _id }: { _id: string }) {
    return DashboardItems.removeDashboardItem(_id);
  }
};

export default dashboardsMutations;
