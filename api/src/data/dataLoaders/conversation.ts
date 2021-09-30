import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Conversations } from '../../db/models';
import { IConversationDocument } from '../../db/models/definitions/conversations';

export default function generateDataLoaderConversation() {
  return new DataLoader<string, IConversationDocument>(
    async (ids: readonly string[]) => {
      const result: IConversationDocument[] = await Conversations.find({
        _id: { $in: ids }
      }).lean();
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
