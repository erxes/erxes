import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendCoreMessage } from '../messageBroker';

export default function generateDataLoaderUser(
  models: IModels,
  subdomain: string
) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: { _id: { $in: ids } }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
