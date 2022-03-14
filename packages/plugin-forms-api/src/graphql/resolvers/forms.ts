import { IContext } from "../../connectionResolver";
import { IFormDocument } from "../../models/definitions/forms";

export default {
  createdUser(form: IFormDocument, _params, { coreModels }: IContext) {
    return coreModels.Users.findOne({ _id: form.createdUserId });
  },

  fields(form: IFormDocument, _params, { models }: IContext) {
    return models.Fields.find({ contentType: 'form', contentTypeId: form._id }).sort({
      order: 1
    });
  }
};