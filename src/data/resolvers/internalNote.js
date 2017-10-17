import { Users } from '../../db/models';

export default {
  createdUser(note) {
    return Users.findOne({ _id: note.createdUserId });
  },
};
