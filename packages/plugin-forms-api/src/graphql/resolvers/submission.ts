import { IContext } from "../../connectionResolver";
import { sendContactsMessage } from "../../messageBroker";
// import { IFormDocument } from "../../models/definitions/forms";

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.FormSubmissions.findOne({ _id });
  },

  async customer(formSubmission: any, { subdomain }: IContext) {
    return await sendContactsMessage({
      subdomain,
      action: "customers.findOne",
      data: { _id: formSubmission.customerId },
      isRPC: true,
      defaultValue: []
    });
  }
};
