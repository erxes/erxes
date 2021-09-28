import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Companies } from '../../db/models';
import { ICompanyDocument } from '../../db/models/definitions/companies';

export default function generateDataLoaderCompany() {
  return new DataLoader<string, ICompanyDocument>(
    async (ids: readonly string[]) => {
      const result: ICompanyDocument[] = await Companies.find({
        _id: { $in: ids }
      });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
