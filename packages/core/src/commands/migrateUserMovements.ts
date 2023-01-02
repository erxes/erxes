import * as dotenv from 'dotenv';

dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';
const { MONGO_URL } = process.env;

if (!MONGO_URL) {
  throw new Error(`Environment variable MONGO_URL not set.`);
}

const client = new MongoClient(MONGO_URL);

let db: Db;

let Users: Collection<any>;
let Branches: Collection<any>;
let Departments: Collection<any>;
let UserMovements: Collection<any>;

const generateOrder = async (model: Collection<any>, res: any) => {
  let parentId = res.parentId;

  let order = '';

  order = res.code
    ? res.code.includes('/')
      ? res.code
      : `${res.code}/`
    : `${res.title}/`;

  while (true) {
    if (!parentId) {
      break;
    }
    const parent = await model.findOne({ _id: parentId });
    if (!parent) {
      break;
    }

    if (parent.order) {
      order = `${parent.order}${order}`;
      break;
    }
    order = parent.code ? `${parent.code}${order}` : `${parent.title}${order}`;

    if (!parent.parentId) {
      break;
    }

    parentId = parent.parentId;
  }
  return order;
};

const command = async () => {
  await client.connect();

  db = client.db() as Db;

  Branches = db.collection('branches');
  Departments = db.collection('departments');
  UserMovements = db.collection('user_movements');
  Users = db.collection('users');

  const models = [
    {
      type: 'branch',
      collection: Branches
    },
    {
      type: 'department',
      collection: Departments
    }
  ];

  try {
    for (let model of models) {
      try {
        await model.collection.find({}).forEach(async res => {
          const { _id, userIds, createdAt, createdBy } = res;
          const newUserMovemment: any[] = [];
          for (const userId of userIds || []) {
            newUserMovemment.push({
              contentType: model.type,
              contentTypeId: _id,
              userId: userId,
              createdAt,
              createdBy
            });
          }
          if (!!newUserMovemment.length) {
            UserMovements.insertMany(newUserMovemment);
            Users.updateMany(
              { _id: { $in: userIds || [] } },
              { $addToSet: { [`${model.type}Ids`]: _id } }
            );
          }

          const order = await generateOrder(model.collection, res);
          model.collection.updateOne({ _id }, { $set: { ...res, order } });
        });
      } catch (e) {
        console.log(`Error occurred: ${e.message}`);
      }
    }
  } catch (e) {
    console.log(`Error occurred: ${e.message}`);
  }

  console.log(`Process finished at: ${new Date()}`);

  process.exit();
};
command();
