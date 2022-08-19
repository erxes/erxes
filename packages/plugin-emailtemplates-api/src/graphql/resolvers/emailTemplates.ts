import { IEmailTemplateDocument } from '../../models/definitions/emailTemplates';

export default {
  /* created user of an email template */
  createdUser(emailTemplate: IEmailTemplateDocument) {
    return (
      emailTemplate.createdBy && {
        __typename: 'User',
        _id: emailTemplate.createdBy
      }
    );
  }
};
