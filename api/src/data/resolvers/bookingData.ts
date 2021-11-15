import { ProductCategories, Products } from '../../db/models';
import { PRODUCT_STATUSES } from '../../db/models/definitions/constants';
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
      count?: number;
    }> = [];

    const mainCategory = await ProductCategories.getProductCatogery({
      _id: booking.productCategoryId
    });

    const allCategories = await ProductCategories.find({
      order: { $regex: new RegExp(mainCategory.order) }
    }).sort({ name: 1 });

    const allProducts = await Products.find({
      categoryId: { $in: allCategories.map(cat => cat._id) },
      status: { $ne: PRODUCT_STATUSES.DELETED }
    }).sort({ name: 1 });

    const generateTree = async (parentId: any) => {
      const categories = allCategories.filter(cat => cat.parentId === parentId);

      if (categories.length === 0) {
        const products = allProducts.filter(
          product => product.categoryId === parentId
        );

        for (const product of products) {
          const count = product.productCount || 0;

          tree.push({
            _id: product._id,
            name: product.name,
            description: product.description,
            parentId,
            type: 'product',
            count
          });
        }
      }

      for (const category of categories) {
        const childrenCatIds = allCategories.flatMap(cat => {
          if (cat.order.includes(category.order)) {
            return cat._id;
          }

          return [];
        });

        const products = allProducts.flatMap(product => {
          const count = product.productCount || 0;

          if (count > 0 && childrenCatIds.includes(product.categoryId || '')) {
            return product;
          }

          return [];
        });

        tree.push({
          _id: category._id,
          name: category.name,
          description: category.description,
          parentId,
          type: 'category',
          status: category.status,
          count: products.length
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
