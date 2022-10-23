import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let ProductCategories: Collection<any>;

const setOrder = async (categories, parentCategory?) => {
  for (const category of categories) {
    const parentOrder = parentCategory ? parentCategory.order : '' || '';
    await ProductCategories.updateOne(
      { _id: category._id },
      { $set: { order: `${parentOrder}${category.code}/` } }
    );

    const childs =
      (await ProductCategories.find({ parentId: category._id }).toArray()) ||
      [];

    if (childs.length) {
      await setOrder(childs, category);
    }
  }
};

const command = async () => {
  await client.connect();
  db = client.db() as Db;

  ProductCategories = db.collection('product_categories');

  const rootCategories =
    (await ProductCategories.find({
      parentId: { $in: ['', null, undefined] }
    }).toArray()) || [];
  await setOrder(rootCategories);

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};

command();
