import { IContext } from '../../connectionResolver';
import { IDepartmentDocument } from '../../db/models/definitions/structures';

export default {
  users(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.findUsers({
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

  parent(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Departments.findOne({ _id: department.parentId });
  },

  children(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Departments.find({ parentId: department._id });
  },

  childCount(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Departments.countDocuments({ parentId: department._id });
  },

  supervisor(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.findOne({
      _id: department.supervisorId,
      isActive: true
    });
  }
};
