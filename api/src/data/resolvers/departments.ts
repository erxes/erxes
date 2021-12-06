import { Departments, Users } from '../../db/models';
import { IDepartmentDocument } from '../../db/models/definitions/structures';

export default {
  users(department: IDepartmentDocument) {
    return Users.find({
      _id: { $in: department.userIds || [] },
      isActive: true
    });
  },

  parent(department: IDepartmentDocument) {
    return Departments.findOne({ _id: department.parentId });
  },

  children(department: IDepartmentDocument) {
    return Departments.find({ parentId: department._id });
  },

  supervisor(department: IDepartmentDocument) {
    return Users.findOne({ _id: department.supervisorId, isActive: true });
  }
};
