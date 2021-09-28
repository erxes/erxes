import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { ProductCategories } from '../../db/models';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';

export default function generateDataLoaderProductCategory() {
  return new DataLoader<string, IProductCategoryDocument>(
    async (ids: readonly string[]) => {
      const result: IProductCategoryDocument[] = await ProductCategories.find({
        _id: { $in: ids }
      });
      const resultById = _.indexBy(result, '_id');
      return ids.map(id => resultById[id]);
    }
  );
}
