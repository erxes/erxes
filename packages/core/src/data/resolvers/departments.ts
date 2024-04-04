import { IContext } from '../../connectionResolver';
import { IDepartmentDocument } from '../../db/models/definitions/structures';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Departments.findOne({ _id });
  },

  async users(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.findUsers({
      departmentIds: { $in: department._id },
      isActive: true
    });
  },

  async userIds(branch: IDepartmentDocument, _args, { models }: IContext) {
    const departmentUsers = await models.Users.findUsers({
      departmentIds: { $in: branch._id },
      isActive: true
    });

    const userIds = departmentUsers.map(user => user._id);
    return userIds;
  },

  userCount(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.countDocuments({
      departmentIds: { $in: department._id || [] },
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
