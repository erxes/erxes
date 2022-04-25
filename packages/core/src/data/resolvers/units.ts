import { IContext } from '../../connectionResolver';
import { Departments } from '../../db/models';
import { IUnitDocument } from '../../db/models/definitions/structures';

export default {
  users(unit: IUnitDocument, _args, { models }: IContext) {
    return models.Users.find({
      _id: { $in: unit.userIds || [] },
      isActive: true
    });
  },

  department(unit: IUnitDocument) {
    return Departments.findOne({ _id: unit.departmentId });
  },

  supervisor(unit: IUnitDocument, _args, { models }: IContext) {
    return models.Users.findOne({ _id: unit.supervisorId, isActive: true });
  }
};
