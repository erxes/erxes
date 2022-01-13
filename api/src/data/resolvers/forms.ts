import { Fields, Forms } from '../../db/models';
import { IFormDocument } from '../../db/models/definitions/forms';
import { getDocument } from './mutations/cacheUtils';

export default {
  __resolveReference: ({ _id }) => {
    return Forms.findOne({ _id });
  },

  createdUser(form: IFormDocument) {
    return getDocument('users', { _id: form.createdUserId });
  },

  fields(form: IFormDocument) {
    return Fields.find({ contentType: 'form', contentTypeId: form._id }).sort({
      order: 1
    });
  }
};
