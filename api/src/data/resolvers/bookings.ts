import { IBookingDocument } from '../../db/models/definitions/bookings';
import {
  Brands,
  Users,
  Tags,
  ProductCategories,
  Products
} from '../../db/models';

export default {
  brand(booking: IBookingDocument) {
    return Brands.findOne({ _id: booking.brandId });
  },

  createdUser(booking: IBookingDocument) {
    return Users.findOne({ _id: booking.createdBy });
  },

  tags(booking: IBookingDocument) {
    return Tags.find({ _id: booking.tagIds });
  },

  async childCategories(booking: IBookingDocument) {
    return ProductCategories.find({ parentId: booking.productCategoryId });
  },

  async categoryTree(booking: IBookingDocument) {
    const tree: Array<{
      _id: string;
      name: string;
      parentId?: string;
      type: 'product' | 'category';
    }> = [];

    const generateTree = async (parentId: any) => {
      const categories = await ProductCategories.find({ parentId });

      if (categories.length === 0) {
        const products = await Products.find({ categoryId: parentId });

        for (const product of products) {
          tree.push({
            _id: product._id,
            parentId,
            name: product.name,
            type: 'product'
          });
        }
      }

      for (const cat of categories) {
        tree.push({
          _id: cat._id,
          parentId: cat.parentId,
          name: cat.name,
          type: 'category'
        });

        await generateTree(cat._id);
      }
    };

    await generateTree(booking.productCategoryId);

    return tree;
  }
};
