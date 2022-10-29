import { IModels } from '../connectionResolver';
import * as DataLoader from 'dataloader';
import { sendContactsMessage } from '../messageBroker';
import * as _ from 'underscore';

export default function generateDataLoaderCustomer(models: IModels, subdomain) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendContactsMessage({
      subdomain,
      action: 'customers.find',
      data: { _id: { $in: ids } },
      isRPC: true,
      defaultValue: []
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
