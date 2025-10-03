import { IContext } from '~/connectionResolvers';
import { IDocumentDocument } from '~/modules/documents/types';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Documents.findOne({ _id });
  },

  async createdUser(
    document: IDocumentDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Users.findOne({ _id: document.createdUserId });
  },
};
