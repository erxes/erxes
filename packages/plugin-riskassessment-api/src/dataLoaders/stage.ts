import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';

export default function generateDataLoaderStages(models: IModels, subdomain: string) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        _id: { $in: ids }
      },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
