import { IModels } from '../connectionResolver';
import * as DataLoader from 'dataloader';
import { sendCoreMessage } from '../messageBroker';
import * as _ from 'underscore';
export default function generateDataLoaderDepartment(
  models: IModels,
  subdomain
) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await sendCoreMessage({
      subdomain,
      action: 'departments.find',
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
