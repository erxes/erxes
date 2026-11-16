import { IAutomationVersion } from '@/automations/db/models/AutomationVersions';
import { IContext } from '~/connectionResolvers';

export const AutomationVersion = {
  async createdUser(
    { createdBy }: IAutomationVersion,
    _args: unknown,
    { models }: IContext,
  ) {
    return createdBy ? models.Users.findOne({ _id: createdBy }) : null;
  },
};
