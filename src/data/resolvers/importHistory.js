import { Users } from '../../db/models';

export default {
  importedUser(history) {
    return Users.findOne({ _id: history.importedUserId });
  },
};
