import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Forms } from '../apiCollections';

export default function generateDataLoaderForm() {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await Forms.find({
      _id: { $in: ids }
    }).toArray();

    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
