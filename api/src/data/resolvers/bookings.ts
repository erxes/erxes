import { IBookingDocument } from '../../db/models/definitions/bookings';
import {
  Brands,
  Users,
  Tags,
  ProductCategories,
  Products,
  Forms
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
      type: 'category' | 'product';
    }> = [];

    // tslint:disable-next-line: no-shadowed-variable
    const generateTree = async (parentId: any) => {
      const categories = await ProductCategories.find({ parentId });

      if (categories.length === 0) {
        const products = await Products.find({ categoryId: parentId });

        for (const product of products) {
          tree.push({
            _id: product._id,
            name: product.name,
            parentId,
            type: 'product'
          });
        }
      }

      for (const category of categories) {
        tree.push({
          _id: category._id,
          name: category.name,
          parentId,
          type: 'category'
        });

        await generateTree(category._id);
      }
    };

    await generateTree(booking.productCategoryId);

    return tree;
  },

  async mainProductCategory(booking: IBookingDocument) {
    return ProductCategories.findOne({ _id: booking.productCategoryId });
  },

  form(booking: IBookingDocument) {
    return Forms.findOne({ _id: booking.formId });
  }
};
