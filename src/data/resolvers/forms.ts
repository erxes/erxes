import { Users } from '../../db/models';
import { IFormDocument } from '../../db/models/definitions/forms';

export default {
  createdUser(form: IFormDocument) {
    return Users.findOne({ _id: form.createdUserId });
  },
};
