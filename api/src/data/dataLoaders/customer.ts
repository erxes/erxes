import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Customers } from '../../db/models';
import { ICustomerDocument } from '../../db/models/definitions/customers';

export default function generateDataLoaderCustomer() {
  return new DataLoader<string, ICustomerDocument>(
    async (ids: readonly string[]) => {
      const result: ICustomerDocument[] = await Customers.find({
        _id: { $in: ids }
      }).lean();
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
