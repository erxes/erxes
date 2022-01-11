import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Customers } from '../apiCollections';

export default function generateDataLoaderCustomer() {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await Customers.find({
      _id: { $in: ids }
    }).toArray();
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}
