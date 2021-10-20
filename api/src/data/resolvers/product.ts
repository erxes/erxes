import { Fields } from '../../db/models';
import { IProductDocument } from '../../db/models/definitions/deals';
import { IContext } from '../types';

export default {
  category(product: IProductDocument, _, { dataLoaders }: IContext) {
    if (product.categoryId) {
      return dataLoaders?.productCategory.load(product.categoryId);
    }
  },

  getTags(product: IProductDocument, _, { dataLoaders }: IContext) {
    return dataLoaders?.tag.loadMany(product.tagIds || []);
  },

  vendor(product: IProductDocument, _, { dataLoaders }: IContext) {
    if (product.vendorId) {
      return dataLoaders?.company.load(product.vendorId);
    }
  },

  async customFieldsDataWithText(product: IProductDocument) {
    let { customFieldsData } = product;

    if (!customFieldsData) {
      return null;
    }

    customFieldsData = customFieldsData.filter(el => el.value);

    const data: any = [];

    for (const el of customFieldsData) {
      const field = await Fields.aggregate([
        { $match: { _id: el.field } },
        { $project: { text: '$text' } }
      ]);
      const { text } = field[0];

      data.push({
        text,
        value: el.value
      });
    }

    return data;
  }
};
