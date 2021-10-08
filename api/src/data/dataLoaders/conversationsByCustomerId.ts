import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Conversations } from '../../db/models';

export default function generateDataLoaderConversation() {
  return new DataLoader<string, any[]>(
    async (customerIds: readonly string[]) => {
      const result: any[] = await Conversations.find({
        customerId: { $in: customerIds }
      }).lean();
      const resultByCustomerId = _.groupBy(result, 'customerId');
      return customerIds.map(id => resultByCustomerId[id] || []);
    }
  );
}
