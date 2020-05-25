import { DashboardItems, Dashboards } from '../../../db/models';
import { IDashboard, IDashboardItemInput } from '../../../db/models/definitions/dashboard';
import { checkPermission } from '../../permissions/wrappers';

interface IDashboardEdit extends IDashboard {
  _id: string;
}
interface IDashboardItemEdit extends IDashboardItemInput {
  _id: string;
}

const dashboardsMutations = {
  async dashboardAdd(_root, doc: IDashboard) {
    return Dashboards.create({ ...doc });
  },

  async dashboardEdit(_root, { _id, ...fields }: IDashboardEdit) {
    return Dashboards.editDashboard(_id, fields);
  },

  async dashboardRemove(_root, { _id }: { _id: string }) {
    return Dashboards.removeDashboard(_id);
  },

  async dashboardItemAdd(_root, doc: IDashboardItemInput) {
    return DashboardItems.addDashboardItem({ ...doc });
  },

  async dashboardItemEdit(_root, { _id, ...fields }: IDashboardItemEdit) {
    return DashboardItems.editDashboardItem(_id, fields);
  },

  async dashboardItemRemove(_root, { _id }: { _id: string }) {
    return DashboardItems.removeDashboardItem(_id);
  },
};

checkPermission(dashboardsMutations, 'dashboardItemAdd', 'dashboardItemAdd');
checkPermission(dashboardsMutations, 'dashboardItemEdit', 'dashboardItemEdit');
checkPermission(dashboardsMutations, 'dashboardItemRemove', 'dashboardItemRemove');
checkPermission(dashboardsMutations, 'dashboardAdd', 'dashboardAdd');
checkPermission(dashboardsMutations, 'dashboardEdit', 'dashboardEdit');
checkPermission(dashboardsMutations, 'dashboardRemove', 'dashboardRemove');

export default dashboardsMutations;
