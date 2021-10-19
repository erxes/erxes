import { ProductCategories, Products } from '../../db/models';
import { IBookingData } from '../../db/models/definitions/integrations';

export default {
  async childCategories(booking: IBookingData) {
    return ProductCategories.find({ parentId: booking.productCategoryId });
  },

  async categoryTree(booking: IBookingData) {
    const tree: Array<{
      _id: string;
      name: string;
      parentId?: string;
      type: 'category' | 'product';
      parentIds?: string[];
    }> = [];

    // tslint:disable-next-line: no-shadowed-variable
    const generateTree = async (parentId: any, grandParentId?: string) => {
      const categories = await ProductCategories.find({ parentId });

      if (categories.length === 0) {
        const products = await Products.find({ categoryId: parentId });

        for (const product of products) {
          tree.push({
            _id: product._id,
            name: product.name,
            parentId,
            type: 'product',
            parentIds: [parentId, grandParentId]
          });
        }
      }

      for (const category of categories) {
        tree.push({
          _id: category._id,
          name: category.name,
          parentId,
          type: 'category',
          parentIds: [parentId, grandParentId]
        });

        await generateTree(category._id, category.parentId);
      }
    };

    await generateTree(booking.productCategoryId);

    return tree;
  },

  async mainProductCategory(booking: IBookingData) {
    return ProductCategories.findOne({ _id: booking.productCategoryId });
  }
};
