import { ProductCategories, Products } from '../../db/models';
import { IBookingData } from '../../db/models/definitions/integrations';

export default {
  async categoryTree(booking: IBookingData) {
    const tree: Array<{
      _id: string;
      name: string;
      description?: string;
      parentId?: string;
      type: 'category' | 'product';
      status?: string;
    }> = [];

    const generateTree = async (parentId: any) => {
      const categories = await ProductCategories.find({ parentId });

      if (categories.length === 0) {
        const products = await Products.find({ categoryId: parentId });

        for (const product of products) {
          tree.push({
            _id: product._id,
            name: product.name,
            description: product.description,
            parentId,
            type: 'product'
          });
        }
      }

      for (const category of categories) {
        tree.push({
          _id: category._id,
          name: category.name,
          description: category.description,
          parentId,
          type: 'category',
          status: category.status
        });

        await generateTree(category._id);
      }
    };

    await generateTree(booking.productCategoryId);

    return tree;
  },

  async mainProductCategory(booking: IBookingData) {
    return ProductCategories.findOne({ _id: booking.productCategoryId });
  }
};
