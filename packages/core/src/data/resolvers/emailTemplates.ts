import { IContext } from "../../connectionResolver";
import { IEmailTemplateDocument } from "../../db/models/definitions/emailTemplates";

export default {
  /* created user of an email template */
  async createdUser(
    emailTemplate: IEmailTemplateDocument,
    _params,
    { models }: IContext
  ) {
    return models.Users.findOne({ _id: emailTemplate.createdBy });
  }
};
