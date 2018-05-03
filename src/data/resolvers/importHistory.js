import { Users } from '../../db/models';

export default {
  user(history) {
    return Users.findOne({ _id: history.importedUserId });
  },
};
