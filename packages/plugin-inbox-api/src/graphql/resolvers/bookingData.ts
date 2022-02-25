import {sendProductCategoryRPCMessage, sendProductRPCMessage} from '../../messageBroker'
import { IBookingData } from '../../models/definitions/integrations';

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

    const mainCategory = await sendProductCategoryRPCMessage('findOne', {
      _id: booking.productCategoryId
    })

    const allCategories = await sendProductCategoryRPCMessage('find', {
      query: {
      // order: { $regex: new RegExp(mainCategory.order) }
      },
      reg: {
        value: mainCategory.order,
        order: { $regex: new RegExp(mainCategory.order) }
      },
      sort: {
        name: 1
      }
    })


    const allProducts = await sendProductRPCMessage('find', {
      query: {
        categoryId: { $in: allCategories.map(cat => cat._id) },
        status: { $ne: 'deleted' },
      },
      sort: { name: 1 }
    })

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
    return {
      __typename: 'ProductCategory',
      _id: booking.productCategoryId
    }
  }
};
