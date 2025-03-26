import * as DataLoader from 'dataloader';
import { IModels } from '../../connectionResolver';
import * as _ from 'underscore';
import { USER_ROLES } from '@erxes/api-utils/src/constants';

export default function generateDataLoaderUser(models: IModels) {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await models.BundleRule.find({
      _id: { $in: ids }
    }).lean();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
