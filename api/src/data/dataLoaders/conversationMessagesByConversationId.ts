import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { ConversationMessages } from '../../db/models';
import { IMessageDocument } from '../../db/models/definitions/conversationMessages';

export default function generateDataLoaderMessage() {
  return new DataLoader<string, IMessageDocument[]>(
    async (ids: readonly string[]) => {
      const result: IMessageDocument[] = await ConversationMessages.find({
        conversationId: { $in: ids }
      }).sort({
        createdAt: 1
      });
      const resultById = await _.groupBy(result, 'conversationId');
      return ids.map(id => resultById[id] || []);
    }
  );
}
