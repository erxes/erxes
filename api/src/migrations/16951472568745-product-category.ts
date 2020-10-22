import { connect } from '../db/connection';
import { ProductCategories, Products } from '../db/models';

module.exports.up = async () => {
  await connect();

  const count = await ProductCategories.find({}).countDocuments();

  if (count > 0) {
    return;
  }

  const category = await ProductCategories.createProductCategory({ name: 'General', code: '0', order: 'General0' });

  await Products.updateMany({}, { $set: { categoryId: category._id } });

  return Promise.resolve('ok');
};
