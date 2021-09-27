import { Departments, Users } from '../../db/models';
import { IDepartmentDocument } from '../../db/models/definitions/structures';

export default {
  users(department: IDepartmentDocument) {
    return Users.find({ _id: { $in: department.userIds || [] } });
  },

  parent(department: IDepartmentDocument) {
    return Departments.findOne({ parentId: department._id });
  },

  children(department: IDepartmentDocument) {
    return Departments.find({ parentId: department._id });
  }
};
