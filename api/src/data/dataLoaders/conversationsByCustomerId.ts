import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Conversations } from '../../db/models';
import { IConversationDocument } from '../../db/models/definitions/conversations';

export default function generateDataLoaderConversation() {
  return new DataLoader<string, IConversationDocument[]>(
    async (customerIds: readonly string[]) => {
      const result: IConversationDocument[] = await Conversations.find({
        customerId: { $in: customerIds }
      });
      const resultByCustomerId = _.groupBy(result, 'customerId');
      return customerIds.map(id => resultByCustomerId[id] || []);
    }
  );
}
