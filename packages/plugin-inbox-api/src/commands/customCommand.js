const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const { MONGO_URL, INTEGRATIONS_MONGO_URL, FB_MONGO_URL } = process.env;

if (!(MONGO_URL && INTEGRATIONS_MONGO_URL && FB_MONGO_URL)) {
  throw new Error(
    `Environment variables MONGO_URL and INTEGRATIONS_MONGO_URL are not set.`
  );
}

const client = new MongoClient(MONGO_URL);
const integrationsClient = new MongoClient(INTEGRATIONS_MONGO_URL);
const fbClient = new MongoClient(FB_MONGO_URL);

let db;
let intDb;
let fbDb;

// inbox
let InboxConversations;
let InboxConversationMessages;
let InboxIntegrations;

// fb
let FbConversationMessages;
let FbIntegrations;
let FbConversations;
let FbAccounts;
let FbCustomers;
let FbPosts;
let FbComments;
let FbConfigs;

// integrations-api
let IntConversations;
let IntConversationMessages;
let IntIntegrations;
let IntAccounts;
let IntCustomers;
let IntPosts;
let IntComments;
let IntConfigs;

const FB_MSNGR = 'facebook-messenger';
const FB_POST = 'facebook-post';

const checkAndInsert = async (
  list,
  collection,
  isConvMsg
) => {
  for (const item of list) {
    let exists = await collection.findOne({ _id: item._id });

    if (isConvMsg && item.mid) {
      exists = await collection.findOne({ mid: item.mid });
    }

    if (item.userId) {
      exists = await collection.findOne({ userId: item.userId });
    }

    if (!exists) {
      await collection.insertOne(item);
    }
  }
};

const command = async () => {
  try {
    await client.connect();
    db = client.db();

    await integrationsClient.connect();
    intDb = integrationsClient.db();

    await fbClient.connect();
    fbDb = fbClient.db();

    // inbox
    InboxIntegrations = db.collection('integrations');
    InboxConversations = db.collection('conversations');
    InboxConversationMessages = db.collection('conversation_messages');

    // integrations
    IntConversations = intDb.collection('conversations_facebooks');
    IntConversationMessages = intDb.collection(
      'conversation_messages_facebooks'
    );
    IntIntegrations = intDb.collection('integrations');
    IntAccounts = intDb.collection('accounts');
    IntCustomers = intDb.collection('customers_facebooks');
    IntPosts = intDb.collection('posts_facebooks');
    IntComments = intDb.collection('comments_facebooks');
    IntConfigs = intDb.collection('configs');

    // fb
    FbAccounts = fbDb.collection('facebook_accounts');
    FbIntegrations = fbDb.collection('facebook_integrations');
    FbConversations = fbDb.collection('conversations_facebooks');
    FbConversationMessages = fbDb.collection('conversation_messages_facebooks');
    FbCustomers = fbDb.collection('customers_facebooks');
    FbPosts = fbDb.collection('posts_facebooks');
    FbComments = fbDb.collection('comments_facebooks');
    FbConfigs = fbDb.collection('facebook_configs');

    /** integrations-api */
    const intIntegrations = await IntIntegrations.find({
      kind: { $in: [FB_MSNGR, FB_POST] }
    }).toArray();
    await checkAndInsert(intIntegrations, FbIntegrations);

    const intConversations = await IntConversations.find({}).toArray();
    await checkAndInsert(intConversations, FbConversations);

    const intConversationMessages = await IntConversationMessages.find().toArray();
    await checkAndInsert(intConversationMessages, FbConversationMessages, true);

    const intAccounts = await IntAccounts.find({ kind: 'facebook' }).toArray();
    await checkAndInsert(intAccounts, FbAccounts);

    const inboxIntegrations = await InboxIntegrations.find({
      kind: { $in: [FB_MSNGR, FB_POST] }
    }).toArray();

    for (const i of inboxIntegrations) {
      const customers = await IntCustomers.find({
        integrationId: i._id
      }).toArray();

      await checkAndInsert(customers, FbCustomers);
    }

    const intPosts = await IntPosts.find().toArray();
    await checkAndInsert(intPosts, FbPosts);

    const intComments = await IntComments.find().toArray();
    await checkAndInsert(intComments, FbComments);

    const intConfigs = await IntConfigs.find({
      code: { $regex: 'facebook_', $options: '$i' }
    }).toArray();
    await checkAndInsert(intConfigs, FbConfigs);

    /** inbox-api */
    const fbMsgIntegrations = await InboxIntegrations.find({
      kind: FB_MSNGR
    }).toArray();

    for (const i of fbMsgIntegrations) {
      const messengerConversations = await InboxConversations.find({
        integrationId: i._id
      }).toArray();

      for (const c of messengerConversations) {
        const inboxMessages = await InboxConversationMessages.find({
          conversationId: c._id
        }).toArray();
        const oldConv = await FbConversations.findOne({ erxesApiId: c._id });

        if (oldConv) {
          const oldMessages = await FbConversationMessages.find({
            conversationId: oldConv._id
          }).toArray();

          for (const msg of inboxMessages) {
            const exists = oldMessages.find(
              o => o.content === msg.content && o.conversationId === oldConv._id
            );

            const doc = { ...msg, conversationId: oldConv._id };

            delete doc._id;

            // merge inbox conv msgs with fb conv msgs since it's a duplicate
            if (exists) {
              const updateDoc = { ...exists, ...doc };

              delete updateDoc._id;

              await FbConversationMessages.updateOne(
                { _id: exists._id },
                { $set: { ...updateDoc } }
              );
            } else {
              await FbConversationMessages.insertOne({ ...doc });
            }
          }
        }
      }
    }

    console.log(`Process finished at: ${new Date()}`);

    fbClient.close();
    integrationsClient.close();
    client.close();

    process.exit();
  } catch (e) {
    console.error(e);
  }
};

command();
