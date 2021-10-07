import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Users } from '../../db/models';
import { IUserDocument } from '../../db/models/definitions/users';

export default function generateDataLoaderTag() {
  return new DataLoader<string, IUserDocument>(
    async (ids: readonly string[]) => {
      const result: IUserDocument[] = await Users.find({ _id: { $in: ids } });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
