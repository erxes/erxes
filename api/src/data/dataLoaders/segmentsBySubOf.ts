import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { Segments } from '../../db/models';

export default function generateDataLoader() {
  return new DataLoader<string, any[]>(async (subOfs: readonly string[]) => {
    const result: any[] = await Segments.find({
      subOf: { $in: subOfs }
    }).lean();
    const groupedBySubOf = _.groupBy(result, 'subOf');
    return subOfs.map(subOf => groupedBySubOf[subOf] || []);
  });
}
