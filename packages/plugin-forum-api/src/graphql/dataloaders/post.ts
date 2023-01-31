import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../../db/models';
import { IPost } from '../../db/models/post';

export default function generateDataLoaderPost(models: IModels) {
  return new DataLoader<string, IPost | null | undefined>(
    async (ids: readonly string[]) => {
      const result: IPost[] = await models.Post.find({
        _id: { $in: ids }
      }).lean();
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
