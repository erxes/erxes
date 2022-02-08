import { IContext } from "@erxes/api-utils/src/types";
import { Fields } from "../../apiCollections";
import { IProductDocument } from "../../models/definitions/products";

export default {
  category(product: IProductDocument, _, { dataLoaders }: IContext) {
    return (
      (product.categoryId &&
        dataLoaders.productCategory.load(product.categoryId)) ||
      null
    );
  },

  async getTags(product: IProductDocument, _, { dataLoaders }: IContext) {
    const tags = await dataLoaders.tag.loadMany(product.tagIds || []);
    return tags.filter(tag => tag);
  },

  vendor(product: IProductDocument, _, { dataLoaders }: IContext) {
    return (
      (product.vendorId && dataLoaders.company.load(product.vendorId)) || null
    );
  },

  async customFieldsDataWithText(product: IProductDocument) {
    let customFieldsData = product.customFieldsData || [];
    customFieldsData = customFieldsData.filter(el => el.value);

    const data: Array<{
      text: string;
      value: string;
    }> = [];

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