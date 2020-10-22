import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';

dotenv.config();

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

const command = async (API_MONGO_URL, MONGO_URL) => {
  const apiMongoClient = await mongoose.createConnection(API_MONGO_URL, options);
  const integrationMongoClient = await mongoose.createConnection(MONGO_URL, options);

  const find = async (name, apiCollection, collection, callback?: (entry) => void) => {
    const entries = await collection.find({}).toArray();

    let count = 0;

    for (const entry of entries) {
      const entryOnApi = await apiCollection.findOne({ _id: entry.erxesApiId });

      if (!entryOnApi) {
        count++;

        if (callback) {
          await callback(entry);
        }
      }
    }

    console.log(`Invalid ${name} count ${count}`);
  };

  // find invalid customers
  const apiCustomers = apiMongoClient.db.collection('customers');
  const integrationCustomers = integrationMongoClient.db.collection('customers_facebooks');
  await find('customer', apiCustomers, integrationCustomers);

  // find invalid conversations
  const apiConversations = apiMongoClient.db.collection('conversations');
  const integrationConversations = integrationMongoClient.db.collection('conversations_facebooks');
  const integrationConversationMessages = integrationMongoClient.db.collection('conversation_messages_facebooks');
  await find('conversation', apiConversations, integrationConversations, async conversation => {
    const messagesCount = await integrationConversationMessages.find({ conversationId: conversation._id }).count();

    console.log(`Messages count ${messagesCount}`);
  });

  process.exit();
};

command('mongodb://localhost/erxes', 'mongodb://localhost/erxes_integrations');
