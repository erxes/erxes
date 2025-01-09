import { IContext } from '../../connectionResolver';
import { IFormDocument } from '../../db/models/definitions/forms';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  },
  async createdUser(form: IFormDocument, _params, { models }: IContext) {
    if (!form.createdUserId) {
      return;
    }
    const user = await models.Users.findOne({ _id: form.createdUserId }).lean();

    return user || null;
  },

  async fields(form: IFormDocument, _params, { models }: IContext) {
    const fields = await models.Fields.find({
      contentType: 'form',
      contentTypeId: form._id,
    }).sort({
      order: 1,
    });

    const subFieldIds = fields
      .filter((f) => f.subFieldIds)
      .map((f) => f.subFieldIds)
      .flat();

    // remove sub fields
    return fields.filter((f) => !subFieldIds.includes(f._id));
  },

  async brand(form: IFormDocument, _params, { models }: IContext) {
    if (!form.brandId) {
      return null;
    }

    return models.Brands.findOne({ _id: form.brandId });
  },

  async tags(form: IFormDocument, _params, { models }: IContext) {
    return models.Tags.find({ _id: { $in: form.tagIds || [] } }).lean()
  }
};
