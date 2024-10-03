import { IContext } from "../../connectionResolver";

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.FormSubmissions.findOne({ _id });
  },

  async customer(formSubmission: any, { models }: IContext) {
    return await models.Customers.findOne({ _id: formSubmission.customerId });
  }
};
