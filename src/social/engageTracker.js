/* eslint-disable no-console */
import AWS from 'aws-sdk';
import { EngageMessages } from '../db/models';

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_CONFIG_SET,
  AWS_ENDPOINT,
} = process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

const sns = new AWS.SNS();
const ses = new AWS.SES();

// export const isVerifiedEmail = async email => {
//   let isVerified = false;
//
//   new Promise(async (resolve, reject) => {
//     await ses
//       .listVerifiedEmailAddresses()
//       .promise()
//       .then(result => {
//         const { VerifiedEmailAddresses = [] } = result;
//
//         if (VerifiedEmailAddresses.includes(email)) isVerified = true;
//       });
//
//     if (isVerified) resolve(true);
//     else reject(new Error('Emnail not verified, please verify email'));
//   });
// };

const handleMessage = async message => {
  const obj = JSON.parse(message);

  const { eventType, mail } = obj;
  const { headers } = mail;

  const engageMessageId = headers.find(obj => obj.name === 'Engagemessageid');
  const mailId = headers.find(obj => obj.name === 'Mailmessageid');

  const type = eventType.toLowerCase();

  await EngageMessages.updateStats(engageMessageId.value, type);

  await EngageMessages.changeDeliveryReportStatus(engageMessageId.value, mailId.value, type);
};

const init = () => {
  let topicArn = '';

  sns
    .createTopic({
      Name: AWS_CONFIG_SET,
    })
    .promise()
    .then(result => {
      topicArn = result.TopicArn;

      return sns
        .subscribe({
          TopicArn: topicArn,
          Protocol: 'http',
          Endpoint: AWS_ENDPOINT,
        })
        .promise();
    })
    .then(() => {
      console.log('Successfully subscribed to the topic');

      return ses
        .createConfigurationSet({
          ConfigurationSet: {
            Name: AWS_CONFIG_SET,
          },
        })
        .promise();
    })
    .catch(error => {
      console.log(error.message);
    })
    .then(() => {
      console.log('Successfully created config set');

      return ses
        .createConfigurationSetEventDestination({
          ConfigurationSetName: AWS_CONFIG_SET,
          EventDestination: {
            MatchingEventTypes: [
              'send',
              'reject',
              'bounce',
              'complaint',
              'delivery',
              'open',
              'click',
              'renderingFailure',
            ],
            Name: AWS_CONFIG_SET,
            Enabled: true,
            SNSDestination: {
              TopicARN: topicArn,
            },
          },
        })
        .promise();
    })
    .catch(error => {
      console.log(error.message);
    });
};

export const trackEngages = expressApp => {
  init();
  // isVerifiedEmail('asd123@gmail.com')
  // .then(console.log('success'))
  // .catch(e=> console.log('caught it', e));

  expressApp.post(`/service/engage/tracker`, (req, res) => {
    const chunks = [];

    req.setEncoding('utf8');

    req.on('data', chunk => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const message = JSON.parse(chunks.join(''));

      const { Type = '', Message = {}, Token = '', TopicArn = '' } = message;

      if (Type === 'SubscriptionConfirmation') {
        return sns.confirmSubscription({ Token, TopicArn });
      }

      handleMessage(Message);
    });

    res.end('success');
  });
};
