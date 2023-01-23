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

const codes: string[] = [];

const uniqueCode = (code, counter) => {
  if (codes.includes(code)) {
    counter += 1;
    if (codes.includes(`${code}${counter}`)) {
      return uniqueCode(code, counter);
    }
    return `${code}${counter}`;
  }
  codes.push(code);
  return code;
};

const generateOrder = async (models, items: any[], parent?: any) => {
  console.log(`${items.length}, ${parent ? parent.order : ''}...`);
  for (const item of items) {
    const { _id, userIds, createdAt, createdBy } = item;
    const newUserMovemment: any[] = [];
    for (const userId of userIds || []) {
      newUserMovemment.push({
        contentType: models.type,
        contentTypeId: _id,
        userId: userId,
        createdAt,
        createdBy,
        isActive: true
      });
    }
    if (!!newUserMovemment.length) {
      UserMovements.insertMany(newUserMovemment);
      Users.updateMany(
        { _id: { $in: userIds || [] } },
        { $addToSet: { [`${models.type}Ids`]: _id } }
      );
    }

    let code = item.code || item.title;

    let parentOrder = parent ? parent.order : '';
    code = uniqueCode(code, 0);

    await models.collection.updateOne(
      { _id },
      {
        $set: {
          ...item,
          code,
          order: `${parentOrder}${code}/`,
          status: 'active'
        }
      }
    );

    const child = await models.collection.find({ parentId: _id }).toArray();

    if (child.length) {
      await generateOrder(models, child, item);
    }
  }
};

const command = async () => {
  console.log(`start.... ${MONGO_URL}`);

  await client.connect();

  console.log('connected...');
  db = client.db() as Db;

  Branches = db.collection('branches');
  Departments = db.collection('departments');
  UserMovements = db.collection('user_movements');
  Users = db.collection('users');

  const modelsMap = [
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
    for (let models of modelsMap) {
      console.log(`${models.type} .......`);
      try {
        const roots = await models.collection
          .find({
            parentId: { $in: ['', null, undefined] }
          })
          .toArray();
        await generateOrder(models, roots);
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
