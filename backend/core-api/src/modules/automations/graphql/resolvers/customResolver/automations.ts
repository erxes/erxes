import { IAutomationDoc } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';

export default {
  async createdUser(
    { createdBy }: IAutomationDoc,
    _args: unknown,
    { models }: IContext,
  ) {
    return await models.Users.findOne({ _id: createdBy });
  },

  async updatedUser(
    { updatedBy }: IAutomationDoc,
    _args: unknown,
    { models }: IContext,
  ) {
    return await models.Users.findOne({ _id: updatedBy });
  },

  async tags({ tagIds }: IAutomationDoc, _args: unknown, { models }: IContext) {
    return await models.Tags.find({ _id: { $in: tagIds } });
  },
};
