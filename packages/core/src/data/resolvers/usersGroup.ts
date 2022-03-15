import { Users } from '../../db/models';
import { IUserGroupDocument } from '../../db/models/definitions/permissions';

const getUsers = async (id: string) => {
  return Users.find(
    { groupIds: { $in: [id] } },
    { _id: 1, email: 1, 'details.avatar': 1, 'details.fullName': 1 }
  );
};

export default {
  async memberIds(group: IUserGroupDocument) {
    const users = await getUsers(group._id);

    return users.map(u => u._id);
  },

  async members(group: IUserGroupDocument) {
    return getUsers(group._id);
  }
};
