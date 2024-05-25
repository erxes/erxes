import { IContext } from '../../connectionResolver';
import { IDepartmentDocument } from '../../db/models/definitions/structures';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
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

  async userCount(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.countDocuments({
      departmentIds: { $in: department._id || [] },
      isActive: true
    });
  },

  async parent(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Departments.findOne({ _id: department.parentId });
  },

  async children(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Departments.find({ parentId: department._id });
  },

  async childCount(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Departments.countDocuments({ parentId: department._id });
  },

  async supervisor(department: IDepartmentDocument, _args, { models }: IContext) {
    return models.Users.findOne({
      _id: department.supervisorId,
      isActive: true
    });
  }
};
