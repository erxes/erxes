import { Dashboards } from '../../db/models';
import { IDashboardDocument } from '../../db/models/definitions/dashboard';

export default {
  childs(dashboard: IDashboardDocument) {
    return Dashboards.find({
      parentId: dashboard._id
    }).sort({
      createdDate: -1
    });
  }
};
