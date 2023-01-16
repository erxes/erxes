import { IUserMovementDocument } from '../../db/models/definitions/users';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.UserMovements.findOne({ _id });
  },

  async createdByDetail(
    userMovement: IUserMovementDocument,
    _args,
    { models }: IContext
  ) {
    return models.Users.findOne({ _id: userMovement.createdBy });
  },

  async userDetail(
    userMovement: IUserMovementDocument,
    _args,
    { models }: IContext
  ) {
    return models.Users.findOne({ _id: userMovement.userId });
  },

  async contentTypeDetail(
    userMovement: IUserMovementDocument,
    _args,
    { models }: IContext
  ) {
    switch (userMovement.contentType) {
      case 'branch':
        return await models.Branches.findOne({
          _id: userMovement.contentTypeId
        });
      case 'department':
        return await models.Departments.findOne({
          _id: userMovement.contentTypeId
        });
      default:
        return null;
    }
  }
};
