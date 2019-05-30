import { Users } from '../../db/models';
import { IUserGroupDocument } from '../../db/models/definitions/permissions';

export default {
  async memberIds(group: IUserGroupDocument) {
    const users = await Users.find({ groupIds: { $in: [group._id] } }, { _id: 1 }).lean();

    return users.map(user => user._id);
  },
};
