import { IContext, IModels } from '../../connectionResolver';
import { IUserGroupDocument } from '../../db/models/definitions/permissions';

const getUsers = async (models: IModels, id: string) => {
  return models.Users.findUsers(
    { groupIds: { $in: [id] } },
    { _id: 1, email: 1, 'details.avatar': 1, 'details.fullName': 1 }
  );
};

export default {
  async memberIds(group: IUserGroupDocument, _args, { models }: IContext) {
    const users = await getUsers(models, group._id);

    return users.map(u => u._id);
  },

  async members(group: IUserGroupDocument, _args, { models }: IContext) {
    return getUsers(models, group._id);
  }
};
