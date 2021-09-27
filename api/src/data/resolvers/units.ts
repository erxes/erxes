import { Departments, Users } from '../../db/models';
import { IUnitDocument } from '../../db/models/definitions/structures';

export default {
  users(unit: IUnitDocument) {
    return Users.find({ _id: { $in: unit.userIds || [] } });
  },

  department(unit: IUnitDocument) {
    return Departments.findOne({ _id: unit.departmentId });
  }
};
