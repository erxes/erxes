import { IContext } from '../../connectionResolver';
import { Departments } from '../../db/models';
import { IDepartmentDocument } from '../../db/models/definitions/structures';

export default {
  users(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.find({
      _id: { $in: department.userIds || [] },
      isActive: true
    });
  },

  userCount(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.countDocuments({
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

  childCount(department: IDepartmentDocument) {
    return Departments.countDocuments({ parentId: department._id });
  },

  supervisor(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: department.supervisorId, isActive: true });
  }
};
