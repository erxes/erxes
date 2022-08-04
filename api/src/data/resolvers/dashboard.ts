import { Dashboards } from '../../db/models';
import { IDashboardDocument } from '../../db/models/definitions/dashboard';

export default {
  childsDashboard(dashboard: IDashboardDocument) {
    return Dashboards.find({
      parentId: dashboard._id
    }).sort({
      createdDate: -1
    });
  }
};
