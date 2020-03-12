import * as amqplib from 'amqplib';
import { connect, disconnect } from '../db/connection';
import { Customers } from '../db/models';

const { RABBITMQ_HOST = 'amqp://localhost' } = process.env;

connect().then(async () => {
  const connection = await amqplib.connect(RABBITMQ_HOST);
  const channel = await connection.createChannel();

  const verify = async () => {
    const customers = await Customers.find(
      { primaryEmail: { $exists: true, $ne: null }, emailValidationStatus: { $exists: false } },
      { primaryEmail: 1 },
    );

    const emails = customers.map(customer => customer.primaryEmail);

    const args = {
      action: 'emailVerify',
      data: { emails },
    };

    await channel.assertQueue('erxes-api:engages-notification');
    await channel.sendToQueue('erxes-api:engages-notification', Buffer.from(JSON.stringify(args)));
  };

  verify();

  // listen for engage notification ===========
  await channel.assertQueue('engagesBulkEmailNotification');

  channel.consume('engagesBulkEmailNotification', async msg => {
    if (msg !== null) {
      console.log('Bulk status: ', JSON.parse(msg.content.toString()));

      channel.ack(msg);

      channel.connection.close();

      disconnect();

      process.exit();
    }
  });
});
