import { ILogDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export default {
  __resolveReference({ _id }: ILogDocument, { models }: IContext) {
    return models.Logs.findOne({ _id });
  },
  async user({ userId }: ILogDocument, {}, { models }: IContext) {
    return await models.Users.findOne({ _id: userId });
  },
  /**
   * The exact operation name for the row: the GraphQL mutation/query field for
   * graphql logs, otherwise the affected entity (contentType / collection).
   * Read off the stored doc so the list never has to ship the full payload.
   */
  name(log: ILogDocument) {
    const payload =
      (log as { payload?: Record<string, unknown> }).payload || {};
    const contentType = (log as { contentType?: string }).contentType;
    return (
      (payload.mutationName as string) ||
      contentType ||
      (payload.collectionName as string) ||
      null
    );
  },
};
