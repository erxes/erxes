import { MongoClient } from 'mongodb';
import { CONTENT_TYPES } from './constants';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'erxes';
let db;

async function main() {
  // Use connect method to connect to the server
  await client.connect();
  console.log('Connected successfully to server');
  db = client.db(dbName);
  return 'done.';
}

main()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close());

export const _ConversationMessages = async () => {
  const collection = await db.collection('conversation_messages');
  return collection;
};

export const _Conversations = async () => {
  const collection = await db.collection('conversations');
  return collection;
};

export const _Customers = async () => {
  const collection = await db.collection('customers');
  return collection;
};

export const _Tags = async () => {
  const collection = await db.collection('tags');
  return collection;
};

export const _Users = async () => {
  const collection = await db.collection('users');
  return collection;
};

export const _Integrations = async () => {
  const collection = await db.collection('integrations');
  return collection;
};

export const _Conformities = async () => {
  const collection = await db.collection('conformities');
  return collection;
};

export const _Segments = async () => {
  const collection = await db.collection('segments');
  return collection;
};

// find user from elastic or mongo
export const _findUser = async (userId: string) => {
  const Users = await _Users();
  return await Users.findOne({ _id: userId });
};

export const _findElk = async (index, query) => {
  // elksyncer tur orhiw
  return false;
};

// check customer exists from elastic or mongo
export const checkCustomerExists = async (
  id?: string,
  customerIds?: string[],
  segmentIds?: string[],
  tagIds?: string[],
  brandIds?: string[]
) => {
  const Customers = db.collection('customers');
  const customersSelector = {
    _id: id,
    state: { $ne: CONTENT_TYPES.VISITOR },
    ...(await generateCustomerSelector({
      customerIds,
      segmentIds,
      tagIds,
      brandIds
    }))
  };

  return await Customers.findOne(customersSelector);
};

// export const getDocument = async (
//   type: 'users' | 'integrations' | 'brands' | 'channels',
//   selector: { [key: string]: any }
// ) => {
//   const list = await getDocumentList(type, selector);

//   if (list.length > 0) {
//     return list[0];
//   }

//   return null;
// };

// export const getDocumentList = async (
//   type: 'users' | 'integrations' | 'brands' | 'channels' | 'tags' | 'products',
//   selector: { [key: string]: any }
// ) => {
//   const listCache = await get(`erxes_${type}`);

//   let list;

//   if (listCache) {
//     list = JSON.parse(listCache);
//   } else {
//     switch (type) {
//       case 'users': {
//         list = await db
//           .collection(type)
//           .find()
//           .lean();
//         break;
//       }

//       case 'channels': {
//         list = await db
//           .collection(type)
//           .find()
//           .lean();
//         break;
//       }

//       case 'integrations': {
//         list = await db
//           .collection(type)
//           .find()
//           .lean();
//         break;
//       }

//       case 'brands': {
//         list = await db
//           .collection(type)
//           .find()
//           .lean();
//         break;
//       }

//       case 'products': {
//         list = await db
//           .collection(type)
//           .find()
//           .lean();
//         break;
//       }
//       case 'tags': {
//         list = await db
//           .collection(type)
//           .find()
//           .lean();
//         break;
//       }
//     }

//     set(`erxes_${type}`, JSON.stringify(list));
//   }

//   return list.filter(sift(selector));
// };
