import { IContext } from "../../connectionResolver";
import { IFormDocument } from "../../db/models/definitions/forms";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  },
  createdUser(form: IFormDocument, _params, { models }: IContext) {
    if (!form.createdUserId) {
      return;
    }

    return models.Users.findOne({ _id: form.createdUserId });
  },

  async fields(form: IFormDocument, _params, { models }: IContext) {
    const fields = await models.Fields.find({
      contentType: "form",
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
