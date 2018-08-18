import { Users } from '../../db/models';

export default {
  createdUser(form) {
    return Users.findOne({ _id: form.createdUserId });
  },
};
