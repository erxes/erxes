import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { findTags } from '../messageBroker';

export default function generateDataLoaderTag() {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result: any[] = await findTags({ _id: { $in: ids } });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}