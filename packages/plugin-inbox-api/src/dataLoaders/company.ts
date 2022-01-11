import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Companies } from '../apiCollections';

export default function generateDataLoaderCompany() {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await Companies.find({
      _id: { $in: ids }
    }).toArray();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
