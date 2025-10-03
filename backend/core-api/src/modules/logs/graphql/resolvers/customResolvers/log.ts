import { ILogDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference({ _id }: ILogDocument, { models }: IContext) {
    return models.Logs.findOne({ _id });
  },
  async user({ userId }: ILogDocument, {}, { models }: IContext) {
    return await models.Users.findOne({ _id: userId });
  },
};
