import * as amqplib from 'amqplib';
import { connect, disconnect } from '../connection';
import { Emails } from '../models';
import { sendRequest } from '../utils';

console.log('Instruction: yarn checkAndGetBulkEmails taskId');

const { RABBITMQ_HOST = 'amqp://localhost', TRUE_MAIL_API_KEY, EMAIL_VERIFICATION_TYPE = 'truemail' } = process.env;

if (!TRUE_MAIL_API_KEY) {
  console.log('Please configure TRUEMAIL API KEY');

  disconnect();
  process.exit();
}

connect().then(async () => {
  const getTrueMailBulk = async (taskId: string) => {
    const connection = await amqplib.connect(RABBITMQ_HOST);
    const channel = await connection.createChannel();

    const url = `https://truemail.io/api/v1/tasks/${taskId}/download?access_token=${TRUE_MAIL_API_KEY}&timeout=30000`;

    const response = await sendRequest({
      url,
      method: 'GET',
    });

    const rows = response.split('\n');
    const emails: Array<{ email: string; status: string }> = [];

    for (const row of rows) {
      const rowArray = row.split(',');

      if (rowArray.length > 2) {
        const email = rowArray[0];
        const status = rowArray[2];

        emails.push({
          email,
          status,
        });

        const found = await Emails.findOne({ email });

        if (!found) {
          const doc = {
            email,
            status,
            created: new Date(),
          };

          await Emails.create(doc);
        }
      }
    }

    const args = { action: 'emailVerify', data: emails };

    await channel.assertQueue('emailVerifierNotification');
    await channel.sendToQueue('emailVerifierNotification', Buffer.from(JSON.stringify(args)));

    console.log('Successfully get the following emails : \n', emails);

    setTimeout(() => {
      channel.connection.close();

      disconnect();
      process.exit();
    }, 500);
  };

  const check = async () => {
    const argv = process.argv;

    if (argv.length < 3) {
      console.log('Please put taskId after yarn checkAndGetBulkEmails');

      disconnect();
      process.exit();
    }

    const taskId = argv[2];

    switch (EMAIL_VERIFICATION_TYPE) {
      case 'truemail': {
        const url = `https://truemail.io/api/v1/tasks/${taskId}/status?access_token=${TRUE_MAIL_API_KEY}`;

        const response = await sendRequest({
          url,
          method: 'GET',
        });

        const data = JSON.parse(response).data;
        console.log(data);

        if (data.status === 'finished') {
          await getTrueMailBulk(taskId);
        } else {
          disconnect();
          process.exit();
        }

        break;
      }
    }
  };

  await check();
});
