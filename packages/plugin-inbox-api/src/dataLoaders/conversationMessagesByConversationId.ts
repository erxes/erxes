import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';

export default function generateDataLoaderMessage(models: IModels) {
  return new DataLoader<string, any[]>(
    async (conversationIds: readonly string[]) => {
      const result: any[] = await models.ConversationMessages.find({
        conversationId: { $in: conversationIds }
      })
        .sort({
          createdAt: 1
        })
        .lean();
      const resultById = await _.groupBy(result, 'conversationId');
      return conversationIds.map(
        conversationId => resultById[conversationId] || []
      );
    }
  );
}
