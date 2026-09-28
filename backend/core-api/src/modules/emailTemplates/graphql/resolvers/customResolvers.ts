import { IEmailTemplateDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const emailTemplateCustomResolvers = {
  async createdUser(
    { createdBy }: IEmailTemplateDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return createdBy ? models.Users.findOne({ _id: createdBy }) : null;
  },
};
