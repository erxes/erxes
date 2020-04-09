import { connect } from '../db/connection';
import { ConversationMessages, Conversations, Customers } from '../db/models';

const command = async () => {
  await connect();

  const bulkPromise = (data, model) => {
    return new Promise(resolve => {
      if (data.length > 0) {
        const bulk = model.collection.initializeUnorderedBulkOp();

        data.forEach(d => {
          bulk.insert(d);
        });

        bulk.execute(() => {
          resolve(true);
        });
      } else {
        resolve(false);
      }
    });
  };

  const datas: any[] = [];

  const conversation = await Conversations.findOne();
  const conversationMessage = await ConversationMessages.findOne({ formWidgetData: { $exists: true } });

  if (!conversationMessage || !conversation) {
    return null;
  }

  for (let i = 0; i <= 1000000; i++) {
    datas.push({
      name: 'First name',
    });
  }

  await bulkPromise(datas, Customers);

  const customer = await Customers.findOne();

  if (!customer) {
    return null;
  }

  const customerDatas: any[] = [];
  const messageDatas: any[] = [];

  for (let i = 0; i <= 100000; i++) {
    customerDatas.push({
      formId: 'pAJJh3vG8dBPcQKmY',
      customerId: customer._id,
    });

    messageDatas.push({
      conversationId: conversation._id,
      customerId: customer._id,
      formWidgetData: conversationMessage.formWidgetData,
    });
  }

  await bulkPromise(customerDatas, Customers);

  await bulkPromise(messageDatas, ConversationMessages);

  process.exit();
};

command();
