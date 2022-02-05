import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { findCompanies } from '../messageBroker';

export default function generateDataLoaderCompany() {
  return new DataLoader<string, any>(async (ids: readonly string[]) => {
    const result = await findCompanies({
      _id: { $in: ids }
    });
    const resultById = _.indexBy(result, '_id');
    return ids.map(id => resultById[id]);
  });
}