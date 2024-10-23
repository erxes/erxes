import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { sendCoreMessage } from '../messageBroker';

export default function generateDataLoaderCompany(subdomain) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await sendCoreMessage({
      subdomain,
      action: 'companies.findActiveCompanies',
      data: {
        selector: {
          _id: { $in: ids }
        }
      },
      isRPC: true
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
