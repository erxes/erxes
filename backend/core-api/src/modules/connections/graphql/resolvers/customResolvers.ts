import { IContext } from '~/connectionResolvers';
import { TConnectionView } from '@/connections/service';

export const connectionCustomResolvers = {
  async createdUser(
    { createdBy }: TConnectionView,
    _args: undefined,
    { models }: IContext,
  ) {
    return createdBy ? models.Users.findOne({ _id: createdBy }) : null;
  },

  async updatedUser(
    { updatedBy }: TConnectionView,
    _args: undefined,
    { models }: IContext,
  ) {
    return updatedBy ? models.Users.findOne({ _id: updatedBy }) : null;
  },
};
