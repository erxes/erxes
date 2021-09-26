import { Departments, Users } from '../../db/models';
import { IDepartmentDocument } from '../../db/models/definitions/departments';

export default {
  users(department: IDepartmentDocument) {
    return Users.find({ _id: { $in: department.userIds || [] } });
  },

  children(department: IDepartmentDocument) {
    return Departments.find({ parentId: department._id });
  }
};
