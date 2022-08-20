import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';

export default function generateDataLoaderConversation(models: IModels) {
  return new DataLoader<string, any[]>(
    async (customerIds: readonly string[]) => {
      const result: any[] = await models.Conversations.find({
        customerId: { $in: customerIds }
      }).lean();
      const resultByCustomerId = _.groupBy(result, 'customerId');
      return customerIds.map(id => resultByCustomerId[id] || []);
    }
  );
}
