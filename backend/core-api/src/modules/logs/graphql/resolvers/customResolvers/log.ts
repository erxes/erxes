import { ILogDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { sanitizeLogValue } from '../../../sanitize';

type LogRecord = { name?: unknown; title?: unknown } | null;

type LogPayload = {
  prevDocument?: LogRecord;
  fullDocument?: LogRecord;
  result?: LogRecord;
};

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
  docId({ docId }: ILogDocument) {
    return docId ? sanitizeLogValue(String(docId), 'docId') : null;
  },
  recordName(log: ILogDocument) {
    const { prevDocument, fullDocument, result } =
      (log as { payload?: LogPayload }).payload || {};
    const name = [prevDocument, fullDocument, result]
      .map((record) => record?.name || record?.title)
      .find((value) => typeof value === 'string' && value);

    return typeof name === 'string' ? sanitizeLogValue(name, 'name') : null;
  },
};
