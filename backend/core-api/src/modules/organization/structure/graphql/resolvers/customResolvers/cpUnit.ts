import { IContext } from '~/connectionResolvers';
import { IUnitDocument } from '@/organization/structure/@types/structure';

const USER_FIELDS = {
  _id: 1,
  username: 1,
  email: 1,
  'details.avatar': 1,
  'details.fullName': 1,
  'details.shortName': 1,
  'details.position': 1,
};

const DEPARTMENT_FIELDS = {
  _id: 1,
  title: 1,
  code: 1,
  description: 1,
};

export default {
  async users(unit: IUnitDocument, _args: undefined, { models }: IContext) {
    return models.Users.findUsers(
      {
        _id: { $in: unit.userIds || [] },
        isActive: true,
      },
      USER_FIELDS,
    );
  },

  async department(
    unit: IUnitDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    if (!unit.departmentId) {
      return null;
    }

    return models.Departments.findOne(
      { _id: unit.departmentId },
      DEPARTMENT_FIELDS,
    );
  },
};
