import { IModels } from '../connectionResolver';
import * as DataLoader from 'dataloader';
import { sendCoreMessage } from '../messageBroker';
import * as _ from 'underscore';

export default function generateDataLoaderTeamMember(
  models: IModels,
  subdomain
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
