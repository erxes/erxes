import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';

export default function generateDataLoader() {
  return new DataLoader<string, ISegmentDocument>(
    async (ids: readonly string[]) => {
      const result: ISegmentDocument[] = await Segments.find({
        _id: { $in: ids }
      });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
