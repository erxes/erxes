import { IContext } from '../../connectionResolver';
import { IFormDocument } from '../../models/definitions/forms';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  },
  createdUser(form: IFormDocument, _params) {
    if (!form.createdUserId) {
      return;
    }

    return {
      __typename: 'User',
      _id: form.createdUserId
    };
  },

  async fields(form: IFormDocument, _params, { models }: IContext) {
    const fields = await models.Fields.find({
      contentType: 'form',
      contentTypeId: form._id
    }).sort({
      order: 1
    });

    const subFieldIds = fields
      .filter(f => f.subFieldIds)
      .map(f => f.subFieldIds)
      .flat();

    // remove sub fields
    return fields.filter(f => !subFieldIds.includes(f._id));

    return fields;
  }
};
