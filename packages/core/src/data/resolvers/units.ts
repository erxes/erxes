import { IContext } from '../../connectionResolver';
import { IUnitDocument } from '../../db/models/definitions/structures';

export default {
  async users(unit: IUnitDocument, _args, { models }: IContext) {
    return models.Users.findUsers({
      _id: { $in: unit.userIds || [] },
      isActive: true
    });
  },

  async department(unit: IUnitDocument, _args, { models }: IContext) {
    return models.Departments.findOne({ _id: unit.departmentId });
  },

  async supervisor(unit: IUnitDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: unit.supervisorId, isActive: true });
  },

  async userCount(unit: IUnitDocument, _args, { models }: IContext) {
    return models.Users.countDocuments({
      _id: { $in: unit.userIds || [] },
      isActive: true
    });
  }
};
