import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { Schema } from 'mongoose';

/** Attach tenant-scoped report invalidation before compiling a model. */
export const withConversationReportEvents = <T>(
  schema: Schema<T>,
  subdomain: string,
): Schema<T> => {
  const reportSchema = schema.clone();
  const tenant = process.env.VERSION === 'saas' ? subdomain : 'os';

  const publish = async () => {
    try {
      await graphqlPubsub.publish(
        `frontlineConversationReportChanged:${tenant}`,
        {
          frontlineConversationReportChanged: true,
        },
      );
    } catch (error) {
      console.error(
        '[frontline:reports] Failed to publish change event',
        error,
      );
    }
  };

  reportSchema.post('save', publish);
  reportSchema.post('insertMany', publish);
  reportSchema.post('bulkWrite', publish);
  reportSchema.post(
    [
      'updateOne',
      'updateMany',
      'replaceOne',
      'findOneAndUpdate',
      'findOneAndReplace',
      'deleteOne',
      'deleteMany',
      'findOneAndDelete',
    ],
    publish,
  );

  return reportSchema;
};
