import { IModels } from '../connectionResolver';
import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { sendContactsMessage, sendCoreMessage } from '../messageBroker';

export default function generateDataLoaderBranch(models: IModels, subdomain) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCoreMessage({
      subdomain,
      action: 'branches.find',
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
