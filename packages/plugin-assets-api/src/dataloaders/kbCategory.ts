import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendKbMessage } from '../messageBroker';

export default function generateDataLoaderKbCategory(
  models: IModels,
  subdomain
) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendKbMessage({
      subdomain,
      action: 'categories.find',
      data: {
        query: { _id: { $in: ids } }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map((id) => resultById[id]);
  });
}
