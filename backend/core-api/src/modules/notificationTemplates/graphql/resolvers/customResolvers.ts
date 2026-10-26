import { IContext } from '~/connectionResolvers';
import { INotificationTemplateVersion } from '@/notificationTemplates/db/definitions/notificationTemplates';

export const notificationTemplateVersionCustomResolvers = {
  async savedUser(
    { savedBy }: INotificationTemplateVersion,
    _args: undefined,
    { models }: IContext,
  ) {
    return savedBy ? models.Users.findOne({ _id: savedBy }) : null;
  },
};
