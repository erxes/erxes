import * as amqplib from 'amqplib';
import { connect, disconnect } from '../db/connection';
import { Customers } from '../db/models';

const { RABBITMQ_HOST = 'amqp://localhost' } = process.env;

const main = async () => {
  const connection = await amqplib.connect(RABBITMQ_HOST);
  const channel = await connection.createChannel();

  connect().then(async () => {
    const verify = async () => {
      const argv = process.argv;

      let limit = Number.MAX_SAFE_INTEGER;

      if (argv.length > 2) {
        limit = parseInt(argv[2], 10);
      }

      const query = { primaryEmail: { $exists: true, $ne: null }, emailValidationStatus: { $exists: false } };

      const customers = await Customers.find(query, { primaryEmail: 1 }).limit(limit);

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

        setTimeout(() => {
          connection.close();

          disconnect();

          process.exit();
        }, 500);
      }
    });
  });
};

main();
