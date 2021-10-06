import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Tags } from '../../db/models';
import { ITagDocument } from '../../db/models/definitions/tags';

export default function generateDataLoaderTag() {
  return new DataLoader<string, ITagDocument>(
    async (ids: readonly string[]) => {
      const result: ITagDocument[] = await Tags.find({ _id: { $in: ids } });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
