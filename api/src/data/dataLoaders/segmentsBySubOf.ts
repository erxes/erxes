import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Segments } from '../../db/models';
import { ISegmentDocument } from '../../db/models/definitions/segments';

export default function generateDataLoader() {
  return new DataLoader<string, ISegmentDocument[]>(
    async (subOfs: readonly string[]) => {
      const result: ISegmentDocument[] = await Segments.find({
        subOf: { $in: subOfs }
      });
      const groupedBySubOf = _.groupBy(result, 'subOf');
      return subOfs.map(subOf => groupedBySubOf[subOf] || []);
    }
  );
}
