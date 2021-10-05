import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Forms } from '../../db/models';
import { IFormDocument } from '../../db/models/definitions/forms';

export default function generateDataLoaderForm() {
  return new DataLoader<string, IFormDocument>(
    async (ids: readonly string[]) => {
      const result: IFormDocument[] = await Forms.find({
        _id: { $in: ids }
      });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
